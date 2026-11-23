import CopyLinkButton from "./CopyLinkButton";

interface ShareBarProps {
  title: string;
  url: string;
  /** "row" for the byline, "stack" for the desktop side rail. */
  layout?: "row" | "stack";
}

const iconClass = "h-4 w-4";

/**
 * Share links that work without JavaScript (WhatsApp first: most Indian
 * readers share there), plus a copy/native-share button.
 */
export default function ShareBar({ title, url, layout = "row" }: ShareBarProps) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${t}%20${u}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
      ),
    },
    {
      label: "Share on X",
      href: `https://x.com/intent/post?url=${u}&text=${t}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
        </svg>
      ),
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: (
        <svg viewBox="0 0 24 24" className={iconClass} fill="currentColor" aria-hidden="true">
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4V9.5Z" />
        </svg>
      ),
    },
  ];

  const btn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-muted hover:text-ink";

  return (
    <div className={layout === "stack" ? "flex flex-col items-start gap-2" : "flex items-center gap-2"}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className={btn}>
          {l.icon}
        </a>
      ))}
      <CopyLinkButton url={url} title={title} className={btn} />
    </div>
  );
}
