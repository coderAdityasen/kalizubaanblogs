// Server component: Markdown is parsed and rendered to HTML on the server, so
// react-markdown/remark-gfm never ship to the browser. Only the code-block copy
// button (CopyCodeButton) is a client component. Typography lives in
// styles/prose.css (.prose-kz), so the elements here are kept plain.
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyCodeButton from "@/components/CopyCodeButton";
import SmartImage from "@/components/SmartImage";
import { remarkHeadingIds } from "@/lib/toc";
import { toInternalPath } from "@/lib/links";
import { ARTICLE_BODY_FONT } from "@/lib/design";

// Default intrinsic size for images inside article bodies (the editor uploads
// 1600x900 images). Used to reserve the right aspect ratio while loading.
const INLINE_IMAGE_WIDTH = 1600;
const INLINE_IMAGE_HEIGHT = 900;
// The reading column is at most ~700px wide on desktop and full-width on phones.
const INLINE_IMAGE_SIZES = "(min-width: 768px) 700px, 100vw";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const codeText = String(children).replace(/\n$/, "");
  const isInline = !className && !String(children).includes("\n");
  if (isInline) return <code>{children}</code>;

  return (
    <span className="code-block block">
      <span className="flex">
        <span>{className ? className.replace("language-", "") : "code"}</span>
        <CopyCodeButton text={codeText} />
      </span>
      <code className="block overflow-x-auto whitespace-pre p-4 text-[0.85rem] leading-relaxed">{children}</code>
    </span>
  );
}

export default function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div className={`prose-kz ${className}`} data-font={ARTICLE_BODY_FONT}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkHeadingIds]}
        components={{
          // A stray "# " in a body would create a second h1; demote it.
          h1: ({ children }) => <h2>{children}</h2>,
          // Section ids come from remarkHeadingIds (table of contents links).
          h2: ({ children, id }) => <h2 id={id}>{children}</h2>,
          h3: ({ children, id }) => <h3 id={id}>{children}</h3>,
          // Fenced code is <pre><code>; let the CodeBlock own the chrome.
          pre: ({ children }) => <div className="my-6">{children}</div>,
          a: ({ href, children }) => {
            // Links to other kalizubaan articles stay in the same tab and use
            // client-side navigation; only external sources open a new tab.
            const internalPath = toInternalPath(href);
            if (internalPath !== null) {
              if (internalPath.startsWith("#")) return <a href={internalPath}>{children}</a>;
              return <Link href={internalPath}>{children}</Link>;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          img: ({ src, alt, title }) => {
            const imageSrc = typeof src === "string" ? src : "";
            const altText = alt || "Blog image";
            // Markdown `![alt](src "caption")` gives an explicit caption; without
            // one we show the alt text so readers still get a visible caption.
            const caption = title || alt;
            // When the caption repeats the alt text, hide it from screen readers
            // so they don't hear the same sentence twice.
            const captionDuplicatesAlt = !!caption && caption.trim() === (alt || "").trim();
            return (
              <span className="kz-figure">
                <SmartImage
                  src={imageSrc}
                  alt={altText}
                  width={INLINE_IMAGE_WIDTH}
                  height={INLINE_IMAGE_HEIGHT}
                  sizes={INLINE_IMAGE_SIZES}
                  loading="lazy"
                />
                {caption && (
                  <span aria-hidden={captionDuplicatesAlt ? true : undefined} className="kz-caption">
                    {caption}
                  </span>
                )}
              </span>
            );
          },
          // Wide tables scroll inside their own box instead of the page.
          table: ({ children }) => (
            <div className="table-wrap" role="region" aria-label="Table" tabIndex={0}>
              <table>{children}</table>
            </div>
          ),
          code: ({ className, children }) => <CodeBlock className={className}>{children}</CodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
