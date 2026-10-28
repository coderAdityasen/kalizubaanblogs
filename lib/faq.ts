export interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_HEADING = /^##\s+(?:faqs?|frequently\s+asked\s+questions)\b.*$/im;

/** Markdown -> plain text for structured data (links keep their text, images are dropped). */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,:;!?]|$)/g, "$1$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pull question/answer pairs from a post's FAQ section: the "## FAQs" (or
 * "## Frequently asked questions") H2, up to the next H2. Questions are either
 * H3 headings ("### Is IPO allotment random?") or a bold line on its own
 * ("**Is IPO allotment random?**", the format older posts use). The answer is
 * the text until the next question. Pairs without an answer are skipped.
 */
export function extractFaqs(markdown: string): FaqItem[] {
  const start = markdown.search(FAQ_HEADING);
  if (start < 0) return [];
  const afterHeading = markdown.slice(start).replace(FAQ_HEADING, "");
  const nextH2 = afterHeading.search(/^##\s/m);
  const section = nextH2 >= 0 ? afterHeading.slice(0, nextH2) : afterHeading;

  const items: FaqItem[] = [];
  let question: string | null = null;
  let answer: string[] = [];

  const flush = () => {
    if (question) {
      const text = toPlainText(answer.join("\n"));
      if (text) items.push({ question, answer: text });
    }
    question = null;
    answer = [];
  };

  for (const line of section.split("\n")) {
    const h3 = line.match(/^###\s+(.+?)\s*#*\s*$/);
    const bold = line.match(/^\s*(?:\*\*|__)(.+?\?)(?:\*\*|__)\s*(.*)$/);
    if (h3) {
      flush();
      question = toPlainText(h3[1]);
    } else if (bold) {
      flush();
      question = toPlainText(bold[1]);
      if (bold[2]) answer.push(bold[2]);
    } else if (question) {
      // A line that is entirely italic (the compliance note) is not part of an answer.
      if (/^\s*([*_])[^*_].*\1\s*$/.test(line)) continue;
      answer.push(line);
    }
  }
  flush();
  return items;
}

/** Schema.org FAQPage JSON-LD, or null when the post has no FAQ section. */
export function faqJsonLd(markdown: string, pageUrl: string) {
  const faqs = extractFaqs(markdown);
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
