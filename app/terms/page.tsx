import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { absoluteUrl, legalLastUpdated } from "@/lib/site";

const description = "Terms and Conditions for using the Kali Zubaan website and its content.";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description,
  alternates: { canonical: absoluteUrl("/terms") },
  openGraph: { title: "Terms and Conditions | Kali Zubaan", description, url: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <StaticPage title="Terms and Conditions" lastUpdated={legalLastUpdated}>
      <p>By accessing or using Kali Zubaan (the &ldquo;Site&rdquo;), you agree to these Terms. If you do not agree, please do not use the Site.</p>

      <h2>Use of content</h2>
      <p>
        All articles, text and original graphics on the Site are owned by Kali Zubaan unless stated
        otherwise. You may share links and short quotes with credit and a link back. You may not
        republish full articles without written permission.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Content on the Site is for general information only and is not financial, investment,
        medical, health, or legal advice. See our <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use the Site for any unlawful purpose.</li>
        <li>Do not attempt to disrupt, hack or overload the Site.</li>
        <li>Do not scrape or copy content in bulk without permission.</li>
      </ul>

      <h2>Third-party links and ads</h2>
      <p>
        The Site may contain links to third-party websites and display advertisements. We do not
        control and are not responsible for third-party content, products or services.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The Site is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest
        extent permitted by law, Kali Zubaan is not liable for any loss or damage arising from your
        use of the Site or reliance on its content.
      </p>

      <h2>Changes</h2>
      <p>We may update these Terms at any time. Continued use of the Site means you accept the updated Terms.</p>

      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of India.</p>

      <h2>Contact</h2>
      <p>Questions? Visit our <Link href="/contact">Contact page</Link>.</p>
    </StaticPage>
  );
}
