import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoPostPath = path.resolve(__dirname, "../demo-post.json");
const envPath = path.resolve(__dirname, "../.env.local");

// Extract secret key from .env.local if present
let secretKey = "my-super-secret-key-12345";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/BLOG_API_SECRET=(.+)/);
  if (match && match[1]) {
    secretKey = match[1].trim();
  }
}

if (!fs.existsSync(demoPostPath)) {
  console.error("❌ demo-post.json not found at:", demoPostPath);
  process.exit(1);
}

const postData = JSON.parse(fs.readFileSync(demoPostPath, "utf-8"));
const endpoint = process.env.API_URL || "http://localhost:3000/api/posts";

console.log(`🚀 Sending blog post to: ${endpoint}`);
console.log(`🔑 Using API Secret Key: ${secretKey.substring(0, 4)}...${secretKey.slice(-4)}`);
console.log(`📝 Post Title: "${postData.title}"`);

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secretKey}`,
    },
    body: JSON.stringify(postData),
  });

  const result = await response.json();

  if (response.ok && result.success) {
    console.log("\n✅ SUCCESS: Blog post published!");
    console.log(`🔗 Public URL: ${result.url}`);
    console.log(`📦 Storage Engine: ${result.storage}`);
    console.log(`🆔 Post Slug: ${result.post?.slug}`);
  } else {
    console.error("\n❌ FAILED to post blog:");
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }
} catch (err) {
  console.error("\n❌ Error connecting to the server. Is Next.js running at http://localhost:3000?");
  console.error(err.message);
  process.exit(1);
}
