import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { validateAuth } from "@/lib/api-auth";
import { ImageRejectedError, MAX_BYTES, inspectImage, processUpload, variantFileName, type ProcessedFile } from "@/lib/image-pipeline";
import fs from "fs";
import path from "path";

// sharp needs the Node.js runtime; large images can take a few seconds.
export const runtime = "nodejs";
export const maxDuration = 60;

/** Accepted upload types. SVG is no longer accepted (it can carry scripts). */
const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Largest file accepted before compression. (Vercel itself caps request bodies at ~4.5 MB.) */
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

function badRequest(error: string, message: string, status = 400) {
  return NextResponse.json({ success: false, error, message }, { status });
}

/**
 * POST /api/upload
 * multipart/form-data: file (required), bucket (default "blog-images"),
 * folder (default "uploads"), optimize ("false" stores the file exactly as
 * sent, only if it is already ≤ 1 MB).
 *
 * Same auth and response fields as before. `url` now points to a compressed
 * WebP (≤ 1 MB, typically 100–350 KB for a cover) and the response also lists
 * the smaller responsive copies that were written next to it.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate secret key (shared with the posts API)
  const auth = validateAuth(req);
  if (!auth.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: auth.reason,
        help: "Provide header 'Authorization: Bearer <YOUR_BLOG_API_SECRET>' or 'x-api-key: <YOUR_BLOG_API_SECRET>'",
      },
      { status: 401 }
    );
  }

  try {
    // 2. Parse multipart form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return badRequest("Bad Request", "Send the image as multipart/form-data with the key 'file'.");
    }
    const file = formData.get("file");
    const bucketName = (formData.get("bucket") as string) || "blog-images";
    const folder = ((formData.get("folder") as string) || "uploads").replace(/[^a-zA-Z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "");
    const optimize = String(formData.get("optimize") ?? "true").toLowerCase() !== "false";

    if (!file || typeof file === "string") {
      return badRequest("Bad Request", "No image file provided. Include a file with key 'file' in multipart/form-data.");
    }

    const imageFile = file as File;

    // 3. Validate type and size
    if (imageFile.type === "image/svg+xml" || /\.svg$/i.test(imageFile.name || "")) {
      return badRequest("Invalid File Type", "SVG uploads are not accepted (they can carry scripts). Please upload JPEG, PNG, WebP, GIF, or AVIF.");
    }
    if (imageFile.type && !VALID_MIME_TYPES.includes(imageFile.type)) {
      return badRequest(
        "Invalid File Type",
        `File type '${imageFile.type}' is not supported. Please upload JPEG, PNG, WebP, GIF, or AVIF.`
      );
    }
    if (imageFile.size > MAX_UPLOAD_SIZE) {
      return badRequest("File Too Large", "Image exceeds 10MB limit.");
    }

    const originalName = imageFile.name || "image.png";
    const originalExt = path.extname(originalName);
    const baseName =
      path
        .basename(originalName, originalExt)
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "image";
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const stem = `${Date.now()}-${uniqueId}-${baseName}`;
    const inputBuffer = Buffer.from(await imageFile.arrayBuffer());

    // 4. Compress (or, with optimize=false, keep the bytes as sent)
    type StoredFile = ProcessedFile & { fileName: string };
    let files: StoredFile[];
    let mainFile: StoredFile;
    let info: { originalSize: number; width: number; height: number; optimized: boolean; format: string };

    if (optimize) {
      const processed = await processUpload(inputBuffer);
      mainFile = { ...processed.main, fileName: variantFileName(stem, processed.main.width) };
      files = [mainFile, ...processed.variants.map((v) => ({ ...v, fileName: variantFileName(stem, v.width) }))];
      info = {
        originalSize: processed.originalSize,
        width: processed.main.width,
        height: processed.main.height,
        optimized: processed.optimized,
        format: "webp",
      };
    } else {
      if (inputBuffer.length > MAX_BYTES) {
        return badRequest("File Too Large", "With optimize=false the image must already be 1 MB or smaller. Remove optimize=false to have it compressed.");
      }
      // Still verify it is a real raster image (rejects SVG and non-images).
      const check = await inspectImage(inputBuffer);
      const ext = (originalExt || ".png").toLowerCase();
      mainFile = {
        width: check.originalWidth,
        height: check.originalHeight,
        buffer: inputBuffer,
        contentType: imageFile.type || "image/png",
        extension: ext,
        fileName: `${stem}${ext}`,
      };
      files = [mainFile];
      info = { originalSize: inputBuffer.length, width: check.originalWidth, height: check.originalHeight, optimized: false, format: check.format };
    }

    const savedPercent = info.originalSize > 0 ? Math.max(0, Math.round((1 - mainFile.buffer.length / info.originalSize) * 100)) : 0;
    const storagePathFor = (name: string) => (folder ? `${folder}/${name}` : name);

    // 5. Upload to Supabase Storage if configured
    const adminSupabase = getAdminSupabaseClient();

    if (adminSupabase && isSupabaseConfigured) {
      try {
        const { data: buckets } = await adminSupabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucketName);
        if (!bucketExists) {
          await adminSupabase.storage.createBucket(bucketName, { public: true });
        }
      } catch (bucketErr) {
        console.warn("Notice checking/creating bucket:", bucketErr);
      }

      const urls: Record<number, string> = {};
      for (const f of files) {
        const { error: uploadError } = await adminSupabase.storage.from(bucketName).upload(storagePathFor(f.fileName), f.buffer, {
          contentType: f.contentType,
          // File names are unique per upload, so browsers/CDNs can keep them for a year.
          cacheControl: "31536000",
          upsert: true,
        });
        if (uploadError) {
          throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
        }
        urls[f.width] = adminSupabase.storage.from(bucketName).getPublicUrl(storagePathFor(f.fileName)).data.publicUrl;
      }

      return NextResponse.json(
        {
          success: true,
          message: "Image uploaded successfully to Supabase Storage!",
          url: urls[mainFile.width],
          path: storagePathFor(mainFile.fileName),
          bucket: bucketName,
          filename: mainFile.fileName,
          originalName,
          size: mainFile.buffer.length,
          contentType: mainFile.contentType,
          storage: "supabase",
          originalSize: info.originalSize,
          width: info.width,
          height: info.height,
          format: info.format,
          optimized: info.optimized,
          savedPercent,
          variants: Object.fromEntries(files.filter((f) => f !== mainFile).map((f) => [String(f.width), urls[f.width]])),
        },
        { status: 201 }
      );
    }

    // 6. Local Disk Fallback (if Supabase credentials are missing or offline)
    const localUploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }
    for (const f of files) {
      fs.writeFileSync(path.join(localUploadsDir, f.fileName), f.buffer);
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const localUrl = (name: string) => `${protocol}://${host}/uploads/${name}`;

    return NextResponse.json(
      {
        success: true,
        message: "Image saved to local uploads storage (Supabase not configured)",
        url: localUrl(mainFile.fileName),
        path: `/uploads/${mainFile.fileName}`,
        filename: mainFile.fileName,
        originalName,
        size: mainFile.buffer.length,
        contentType: mainFile.contentType,
        storage: "local_disk",
        originalSize: info.originalSize,
        width: info.width,
        height: info.height,
        format: info.format,
        optimized: info.optimized,
        savedPercent,
        variants: Object.fromEntries(files.filter((f) => f !== mainFile).map((f) => [String(f.width), localUrl(f.fileName)])),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ImageRejectedError) {
      return badRequest(error.status === 422 ? "Image Too Large" : "Invalid File Type", error.message, error.status);
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Upload Error",
        message: "Failed to upload image.",
        details: message,
      },
      { status: 500 }
    );
  }
}
