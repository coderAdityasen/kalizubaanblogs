"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Send, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, RefreshCw, KeyRound, Sparkles } from "lucide-react";

const DEFAULT_SAMPLE_PAYLOAD = {
  title: "Building Realtime Architectures with Next.js & Supabase",
  slug: "building-realtime-architectures-nextjs-supabase",
  excerpt: "How we leveraged Supabase PostgreSQL and Next.js server actions to build an ultra-fast event-driven blog pipeline.",
  category: "Architecture",
  tags: ["Supabase", "Next.js", "Postgres", "Serverless"],
  author_name: "Aditya",
  author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  cover_image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
  reading_time: 4,
  published: true,
  content: `## The Modern Realtime Stack\n\nBuilding applications in 2026 demands instantaneous synchronization and robust backend primitives.\n\n### Why Supabase + Next.js?\n\n1. **PostgreSQL Power**: Complete relational integrity, triggers, and JSONB.\n2. **Edge Caching**: Next.js App Router renders at the speed of light.\n3. **API Secret Protection**: Restrict write capabilities to authorized agents and CI/CD pipelines.\n\n\`\`\`typescript\n// Server-side validation\nconst isAuthorized = authHeader === \`Bearer \${process.env.BLOG_API_SECRET}\`;\n\`\`\`\n\n> *Simplicity in architecture is the highest form of engineering refinement.*`
};

export default function ApiPlayground() {
  const [secretKey, setSecretKey] = useState("my-super-secret-key-12345");
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_SAMPLE_PAYLOAD, null, 2));
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"curl" | "fetch" | "python" | "powershell">("curl");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleResetPayload = () => {
    setJsonInput(JSON.stringify(DEFAULT_SAMPLE_PAYLOAD, null, 2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseStatus(null);
    setResponseBody(null);
    setCreatedUrl(null);

    try {
      let parsedPayload: Record<string, unknown>;
      try {
        parsedPayload = JSON.parse(jsonInput);
      } catch (err) {
        setResponseStatus(400);
        setResponseBody(JSON.stringify({ error: "Invalid JSON format: " + (err as Error).message }, null, 2));
        setLoading(false);
        return;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secretKey.trim()}`,
        },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setResponseStatus(res.status);
      setResponseBody(JSON.stringify(data, null, 2));

      if (res.ok && data.url) {
        setCreatedUrl(data.url);
      }
    } catch (err: unknown) {
      setResponseStatus(500);
      setResponseBody(JSON.stringify({ error: "Network error: " + (err as Error).message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const curlCode = `curl -X POST "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/posts" \\
  -H "Authorization: Bearer ${secretKey || '<YOUR_SECRET_KEY>'}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonInput.replace(/'/g, "'\\''")}'`;

  const fetchCode = `fetch("${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/posts", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${secretKey || '<YOUR_SECRET_KEY>'}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${jsonInput})
})
.then(res => res.json())
.then(data => console.log(data));`;

  const pythonCode = `import requests

url = "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/posts"
headers = {
    "Authorization": "Bearer ${secretKey || '<YOUR_SECRET_KEY>'}",
    "Content-Type": "application/json"
}
payload = ${jsonInput}

response = requests.post(url, headers=headers, json=payload)
print(response.status_code, response.json())`;

  const psCode = `$headers = @{
    "Authorization" = "Bearer ${secretKey || '<YOUR_SECRET_KEY>'}"
    "Content-Type"  = "application/json"
}
$body = @'
${jsonInput}
'@

$response = Invoke-RestMethod -Uri "${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/posts" -Method Post -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 5`;

  return (
    <div id="tester" className="scroll-mt-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Terminal className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300">
              Interactive API Playground
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Test Blog Posting API Live</h2>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
            Execute real HTTP POST requests directly to <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-200 font-mono">/api/posts</code> using your secret key.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetPayload}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors border border-white/10"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Sample JSON
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Controls & JSON Input */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Secret Key Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
              API Secret Key (matches <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-zinc-600 dark:text-zinc-400">BLOG_API_SECRET</code>)
            </label>
            <div className="relative">
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your secret key (default: my-super-secret-key-12345)"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Passed via <code className="font-mono">Authorization: Bearer &lt;key&gt;</code> or <code className="font-mono">x-api-key: &lt;key&gt;</code> header.
            </p>
          </div>

          {/* JSON Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                JSON Request Body
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">application/json</span>
            </div>
            <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={16}
                className="w-full p-4 font-mono text-xs sm:text-sm text-emerald-400 bg-transparent focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send POST Request
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right column: Live Result & Code Generator */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Response Box */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                Response Status:
                {responseStatus !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {responseStatus} {responseStatus === 201 ? "Created" : responseStatus === 401 ? "Unauthorized" : ""}
                  </span>
                )}
              </span>

              {responseBody && (
                <button
                  onClick={() => handleCopy(responseBody, "res")}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1"
                >
                  {copiedCode === "res" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedCode === "res" ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {/* Created URL Success Card */}
            {createdUrl && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" /> Post successfully created!
                </div>
                <a
                  href={createdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="truncate mr-2 font-mono">{createdUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}

            {/* Response Output */}
            <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 min-h-[160px] max-h-[260px] overflow-y-auto">
              {responseBody ? (
                <pre className="p-3.5 text-xs font-mono text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {responseBody}
                </pre>
              ) : (
                <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-zinc-400" />
                  <span>Click &quot;Send POST Request&quot; above to see real-time server output.</span>
                </div>
              )}
            </div>
          </div>

          {/* Code Snippets Generator */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Copy Code Snippet
              </span>
              <div className="flex gap-1">
                {(["curl", "fetch", "python", "powershell"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-1 rounded text-[11px] font-medium uppercase transition-colors ${
                      activeTab === tab
                        ? "bg-indigo-600 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 max-h-[180px] overflow-y-auto">
              <button
                onClick={() => {
                  const code =
                    activeTab === "curl"
                      ? curlCode
                      : activeTab === "fetch"
                      ? fetchCode
                      : activeTab === "python"
                      ? pythonCode
                      : psCode;
                  handleCopy(code, "snippet");
                }}
                className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[10px] flex items-center gap-1 backdrop-blur-sm"
              >
                {copiedCode === "snippet" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode === "snippet" ? "Copied" : "Copy"}
              </button>
              <pre className="p-3 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                {activeTab === "curl" && curlCode}
                {activeTab === "fetch" && fetchCode}
                {activeTab === "python" && pythonCode}
                {activeTab === "powershell" && psCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
