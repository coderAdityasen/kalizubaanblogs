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
        Hi, I&apos;m Aditya Sen, a software developer based in Indore, India. I build web
        applications with JavaScript, Node.js and the MERN stack, and I work with AI tools every
        day. I started Kali Zubaan to write the kind of explainers I wanted to read myself: plain
        answers to everyday money, health, side-hustle and tech questions, with the numbers
        checked against their sources.
      </p>

      <h2>What we cover</h2>
      <ul>
        <li>
          <Link href="/blog/category/personal-finance"><strong>Personal finance</strong></Link>:
          SIPs and mutual funds, IPOs, tax deadlines, UPI and banking rules.
        </li>
        <li>
          <Link href="/blog/category/tech-ai"><strong>Tech &amp; AI</strong></Link>: AI model
          launches, phones and the security news that affects Indian users.
        </li>
        <li>
          <Link href="/blog/category/health-fitness"><strong>Health &amp; fitness</strong></Link>:
          weight loss, nutrition and what the research actually says.
        </li>
        <li>
          <Link href="/blog/category/side-hustles"><strong>Side hustles</strong></Link>: real
          income stories, gig apps and the online-earning scams to avoid.
        </li>
      </ul>

      <h2>Why &ldquo;Kali Zubaan&rdquo;?</h2>
      <p>
        In Hindi, <em>kali zubaan</em> (&ldquo;black tongue&rdquo;) is said of someone whose words
        have a way of coming true, the person who says the blunt thing nobody else will. That is
        the spirit of this blog: straight talk, no sugar-coating.
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
