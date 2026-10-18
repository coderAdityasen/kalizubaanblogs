import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import fs from "fs";
import path from "path";

/**
 * Validates request authorization using the API Secret Key.
 * Supports:
 * - Authorization: Bearer <BLOG_API_SECRET>
 * - x-api-key: <BLOG_API_SECRET>
 */
function validateAuth(req: NextRequest): { authorized: boolean; reason?: string } {
  const expectedSecret = process.env.BLOG_API_SECRET || "my-super-secret-key-12345";

  const authHeader = req.headers.get("authorization");
  const apiKeyHeader = req.headers.get("x-api-key");

  let providedSecret: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedSecret = authHeader.substring(7).trim();
  } else if (apiKeyHeader) {
    providedSecret = apiKeyHeader.trim();
  }

  if (!providedSecret) {
    return {
      authorized: false,
      reason: "Missing authentication. Provide 'Authorization: Bearer <secret>' or 'x-api-key: <secret>' header.",
    };
  }

  if (providedSecret !== expectedSecret) {
    return {
      authorized: false,
      reason: "Invalid API secret key. Please check your BLOG_API_SECRET.",
    };
  }

  return { authorized: true };
}

/**
 * POST /api/upload
 * Uploads an image to Supabase Storage bucket and returns its public URL.
 * Requires secret key authorization.
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate secret key
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
    const formData = await req.formData();
    const file = formData.get("file");
    const bucketName = (formData.get("bucket") as string) || "blog-images";
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "No image file provided. Include a file with key 'file' in multipart/form-data.",
        },
        { status: 400 }
      );
    }

    const imageFile = file as File;

    // 3. Validate image MIME type
    const validMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];

    if (imageFile.type && !validMimeTypes.includes(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid File Type",
          message: `File type '${imageFile.type}' is not supported. Please upload JPEG, PNG, WebP, GIF, SVG, or AVIF.`,
        },
        { status: 400 }
      );
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (imageFile.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File Too Large",
          message: "Image exceeds 10MB limit.",
        },
        { status: 400 }
      );
    }

    // 4. Generate clean sanitized filename
    const originalName = imageFile.name || "image.png";
    const extension = path.extname(originalName) || ".png";
    const baseName = path.basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40);

    const uniqueId = Math.random().toString(36).substring(2, 8);
    const sanitizedFileName = `${Date.now()}-${uniqueId}-${baseName}${extension}`;
    const storagePath = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName;

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Upload to Supabase Storage if configured
    const adminSupabase = getAdminSupabaseClient();

    if (adminSupabase && isSupabaseConfigured) {
      // Ensure bucket exists or create it
      try {
        const { data: buckets } = await adminSupabase.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucketName);

        if (!bucketExists) {
          await adminSupabase.storage.createBucket(bucketName, { public: true });
        }
      } catch (bucketErr) {
        console.warn("Notice checking/creating bucket:", bucketErr);
      }

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType: imageFile.type || "image/png",
          // File names are unique per upload, so browsers/CDNs can keep them for a year.
          cacheControl: "31536000",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
      }

      // Retrieve public URL
      const { data: urlData } = adminSupabase.storage
        .from(bucketName)
        .getPublicUrl(storagePath);

      return NextResponse.json(
        {
          success: true,
          message: "Image uploaded successfully to Supabase Storage!",
          url: urlData.publicUrl,
          path: storagePath,
          bucket: bucketName,
          filename: sanitizedFileName,
          originalName,
          size: imageFile.size,
          contentType: imageFile.type || "image/png",
          storage: "supabase",
        },
        { status: 201 }
      );
    }

    // 6. Local Disk Fallback (if Supabase credentials are missing or offline)
    const localUploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }

    const localFilePath = path.join(localUploadsDir, sanitizedFileName);
    fs.writeFileSync(localFilePath, buffer);

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const localPublicUrl = `${protocol}://${host}/uploads/${sanitizedFileName}`;

    return NextResponse.json(
      {
        success: true,
        message: "Image saved to local uploads storage (Supabase not configured)",
        url: localPublicUrl,
        path: `/uploads/${sanitizedFileName}`,
        filename: sanitizedFileName,
        originalName,
        size: imageFile.size,
        contentType: imageFile.type || "image/png",
        storage: "local_disk",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
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
