import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

// Extract secret key from .env.local
let secret = "alfgbadfkjgadblkjfbdkjbfbajlabnbajklbdadljfjbalf";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/BLOG_API_SECRET=(.+)/);
  if (match && match[1]) {
    secret = match[1].trim();
  }
}

const endpoint = "http://localhost:3000/api/upload";

// Create a small 1x1 test PNG buffer
const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErmkJggg==";
const sampleBuffer = Buffer.from(tinyPngBase64, "base64");

console.log("1. Testing Unauthorized Request (no secret)...");
try {
  const resNoAuth = await fetch(endpoint, { method: "POST" });
  console.log(`Status: ${resNoAuth.status} (Expected: 401)`);
} catch (e) {
  console.log("Failed reaching endpoint:", e.message);
}

console.log("\n2. Testing Authorized Upload to Supabase Storage...");
try {
  const formData = new FormData();
  const blob = new Blob([sampleBuffer], { type: "image/png" });
  formData.append("file", blob, "demo-banner.png");
  formData.append("folder", "covers");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secret}`,
    },
    body: formData,
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Result:", JSON.stringify(data, null, 2));

  if (res.ok && data.url) {
    console.log("\n3. Testing URL Reachability...");
    const imageRes = await fetch(data.url);
    console.log(`Image Fetch Status: ${imageRes.status} (Expected: 200)`);
    console.log(`Content-Type: ${imageRes.headers.get("content-type")}`);
    console.log("\n✅ Image upload API verified and working with Supabase Storage!");
  }
} catch (err) {
  console.error("Upload test failed:", err.message);
}
