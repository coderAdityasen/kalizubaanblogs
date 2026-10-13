import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { absoluteUrl } from "@/lib/site";

const description =
  "About Kali Zubaan and its author Aditya Sen: an independent blog on personal finance, health, technology and everyday life.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: { title: "About | Kali Zubaan", description, url: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Kali Zubaan"
      intro="An independent blog with honest, practical writing on money, health, technology and life."
    >
      <h2>Who writes this blog</h2>
      <p>
        Hi, I&apos;m Aditya Sen. [EDIT: Add your real bio here: where you are based, what you do,
        your background or experience, and why you started this blog. 3 to 5 sentences.]
      </p>

      <h2>What we cover</h2>
      <ul>
        <li><strong>Personal finance:</strong> saving, budgeting, investing basics and money habits.</li>
        <li><strong>Health &amp; wellness:</strong> everyday health, fitness and lifestyle topics.</li>
        <li><strong>Technology:</strong> software, AI and tools that make life and work easier.</li>
        <li>[EDIT: Add or remove topics so this list matches what you actually write about.]</li>
      </ul>

      <h2>Why &ldquo;Kali Zubaan&rdquo;?</h2>
      <p>
        In Hindi, <em>kali zubaan</em> (&ldquo;black tongue&rdquo;) is said of someone whose words
        have a way of coming true, the person who says the blunt thing nobody else will. That is
        the spirit of this blog: straight talk, no sugar-coating. [EDIT: Adjust this to your own
        reason for choosing the name, if different.]
      </p>

      <h2>Our approach</h2>
      <p>
        Every article is written to inform, not to sell. Our content is general information and
        not professional advice. Please read our <Link href="/disclaimer">Disclaimer</Link>. Have
        a question or suggestion? <Link href="/contact">Get in touch</Link>.
      </p>
    </StaticPage>
  );
}
