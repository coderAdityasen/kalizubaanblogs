/**
 * Table of contents helpers for article pages.
 *
 * `extractHeadings` reads the post's Markdown line by line and returns its
 * ATX "## " and "### " headings (outside fenced code blocks) with a stable,
 * unique id for each. `remarkHeadingIds` puts those same ids on the rendered
 * <h2>/<h3> elements by matching the heading's source line, so the TOC links
 * and the headings can never disagree.
 */

export interface TocHeading {
  depth: 2 | 3;
  text: string;
  id: string;
  /** 1-based line number of the heading in the Markdown source. */
  line: number;
}

const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const ATX_HEADING = /^ {0,3}(#{2,3})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;

/** Inline Markdown -> the plain text a reader sees in the heading. */
function headingText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,:;!?]|$)/g, "$1$2")
    .replace(/<[^>]+>/g, "")
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Who pays ₹1,200 more?" -> "who-pays-1-200-more" (keeps non-Latin letters). */
export function slugifyHeading(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return slug || "section";
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const used = new Map<string, number>();
  let fence: string | null = null;

  markdown.split(/\r?\n/).forEach((line, index) => {
    const fenceMatch = line.match(FENCE);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (fence === null) fence = marker;
      else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      return;
    }
    if (fence !== null) return;

    const match = line.match(ATX_HEADING);
    if (!match) return;
    const text = headingText(match[2]);
    if (!text) return;

    const base = slugifyHeading(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    headings.push({
      depth: match[1].length as 2 | 3,
      text,
      id: count === 0 ? base : `${base}-${count + 1}`,
      line: index + 1,
    });
  });

  return headings;
}

interface MdNode {
  type: string;
  depth?: number;
  position?: { start: { line: number } };
  data?: { hProperties?: Record<string, unknown> };
  children?: MdNode[];
}

/** Remark plugin: give each "## "/"### " heading the id from extractHeadings. */
export function remarkHeadingIds() {
  return (tree: MdNode, file: { value: unknown }) => {
    const ids = new Map(
      extractHeadings(String(file.value)).map((heading) => [heading.line, heading.id])
    );
    if (ids.size === 0) return;

    const visit = (node: MdNode) => {
      if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
        const id = node.position ? ids.get(node.position.start.line) : undefined;
        if (id) {
          node.data = node.data ?? {};
          node.data.hProperties = { ...node.data.hProperties, id };
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
