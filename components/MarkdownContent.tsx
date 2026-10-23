"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import SmartImage from "@/components/SmartImage";

// Default intrinsic size for images inside article bodies (the editor uploads
// 1600x900 images). Used to reserve the right aspect ratio while loading.
const INLINE_IMAGE_WIDTH = 1600;
const INLINE_IMAGE_HEIGHT = 900;
// The article column is at most ~720px wide on desktop and full-width on phones.
const INLINE_IMAGE_SIZES = "(min-width: 768px) 720px, 100vw";

interface MarkdownContentProps {
  content: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isInline = !className && !String(children).includes("\n");

  if (isInline) {
    return (
      <code className="px-1.5 py-0.5 rounded-md text-xs font-mono bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700/60">
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
        <span>{className ? className.replace("language-", "") : "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-[11px]"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-zinc-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mt-8 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white mt-10 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight text-zinc-900 dark:text-white mt-6 mb-3">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="my-4 text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-800 dark:text-zinc-200">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-zinc-400 dark:text-zinc-500">
              {children}
            </del>
          ),
          ul: ({ children }) => (
            <ul className="my-4 pl-6 list-disc space-y-2 text-zinc-700 dark:text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 pl-6 list-decimal space-y-2 text-zinc-700 dark:text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 pl-4 border-l-4 border-indigo-500 italic text-zinc-700 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-900/60 py-3 rounded-r-xl">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => {
            const imageSrc = typeof src === "string" ? src : "";
            const altText = alt || "Blog image";
            return (
              <span className="block my-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
                {/* Article images are uploaded at 1600x900 (16:9). Passing the
                    size reserves space before the image loads (no layout
                    shift), and SmartImage serves a resized AVIF/WebP for
                    Supabase/Unsplash images instead of the full-size JPEG. */}
                <SmartImage
                  src={imageSrc}
                  alt={altText}
                  width={INLINE_IMAGE_WIDTH}
                  height={INLINE_IMAGE_HEIGHT}
                  sizes={INLINE_IMAGE_SIZES}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                {alt && (
                  <span className="block p-2 text-center text-xs text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50">
                    {alt}
                  </span>
                )}
              </span>
            );
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400 font-mono">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
              {children}
            </td>
          ),
          code: ({ className, children }) => (
            <CodeBlock className={className}>{children}</CodeBlock>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
