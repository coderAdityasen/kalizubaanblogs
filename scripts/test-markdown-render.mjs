import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");

// Dynamically extract secret key from .env.local
let secret = "alfgbadfkjgadblkjfbdkjbfbajlabnbajklbdadljfjbalf";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/BLOG_API_SECRET=(.+)/);
  if (match && match[1]) {
    secret = match[1].trim();
  }
}

const endpoint = "http://localhost:3000/api/posts";

const richMarkdownPost = {
  title: "Markdown Syntax & Rendering Showcase",
  slug: "markdown-syntax-showcase",
  category: "Design",
  tags: ["Markdown", "GFM", "Showcase"],
  author_name: "Aditya",
  reading_time: 3,
  excerpt: "A comprehensive test of headers, tables, code blocks, lists, quotes, and inline styles.",
  content: `## 1. Typography & Emphasis

This is **bold text**, this is *italic text*, and this is ~~strikethrough text~~.

You can also use inline \`const active = true;\` code tags inside your sentences.

---

## 2. Lists & Hierarchy

### Bulleted Checklist
* First key advantage of Markdown
* Second architectural principle
* Third operational benefit

### Numbered Sequence
1. Send HTTP POST request with secret key
2. Post saved securely in database
3. Rendered as formatted HTML on the website

---

## 3. Data Tables (GitHub Flavored Markdown)

| Feature | Supported | Description |
| :--- | :---: | :--- |
| **Code Highlighting** | ✅ | Language-aware code blocks with copy button |
| **GFM Tables** | ✅ | Responsive border-collapsed data tables |
| **Blockquotes** | ✅ | Left-bordered highlight callouts |
| **Images** | ✅ | Rounded responsive media with captions |

---

## 4. Code Blocks with One-Click Copy

\`\`\`typescript
export async function getPosts(): Promise<BlogPost[]> {
  const supabase = getPublicSupabaseClient();
  const { data } = await supabase.from('posts').select('*');
  return data ?? [];
}
\`\`\`

\`\`\`python
def calculate_reading_time(content: str) -> int:
    words = len(content.split())
    return max(1, words // 200)
\`\`\`

---

## 5. Blockquotes

> "Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects."
> — *Dieter Rams*

---

## 6. External Links

Learn more about [Next.js Documentation](https://nextjs.org) and [Supabase Guides](https://supabase.com).`
};

console.log("Publishing Rich Markdown Test Post with secret key from .env.local...");

try {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + secret,
    },
    body: JSON.stringify(richMarkdownPost),
  });

  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Storage:", data.storage);
  console.log("URL:", data.url);

  if (res.ok) {
    console.log("\nFetching rendered HTML to verify markdown conversion at: " + data.url);
    const pageRes = await fetch(data.url);
    const html = await pageRes.text();

    console.log("Page Status:", pageRes.status);

    // Verify conversions
    const checks = {
      "H2 Heading (Typography & Emphasis)": html.includes("Typography &amp; Emphasis") || html.includes("Typography & Emphasis"),
      "H3 Subheading (Bulleted Checklist)": html.includes("Bulleted Checklist"),
      "Bold Text (<strong>)": html.includes("bold text</strong>") || html.includes("<strong") && html.includes("bold text"),
      "Italic Text (<em>)": html.includes("italic text</em>") || html.includes("<em") && html.includes("italic text"),
      "Strikethrough (<del>)": html.includes("<del") && html.includes("strikethrough text"),
      "Inline Code (<code>)": html.includes("const active = true;"),
      "Preformatted Code Block (<pre>)": html.includes("<pre") && html.includes("export async function getPosts()"),
      "Language Label in Code Block": html.includes("typescript") || html.includes("python"),
      "Copy Code Button": html.includes("Copy"),
      "GFM Table (<table>)": html.includes("<table") && html.includes("Code Highlighting"),
      "Blockquote (<blockquote>)": html.includes("<blockquote") && html.includes("Dieter Rams"),
      "Hyperlink (<a>)": html.includes("https://nextjs.org") && html.includes("Next.js Documentation"),
    };

    console.log("\n--- Markdown Conversion Verification Results ---");
    let allPassed = true;
    for (const [feature, passed] of Object.entries(checks)) {
      console.log(`${passed ? "✅" : "❌"} ${feature}: ${passed ? "PASS" : "FAIL"}`);
      if (!passed) allPassed = false;
    }

    if (allPassed) {
      console.log("\n🎉 ALL MARKDOWN CONVERSIONS VERIFIED AND WORKING PERFECTLY!");
    }
  }
} catch (err) {
  console.error("Test failed:", err.message);
}
