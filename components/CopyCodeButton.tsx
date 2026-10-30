"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * The only interactive bit of an article body: the "Copy" button on code
 * blocks. Kept in its own small client component so the Markdown renderer
 * (react-markdown + remark-gfm, ~47 KiB gzipped) runs on the server and is
 * never shipped to readers' browsers.
 */
export default function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-[11px]"
      title="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
