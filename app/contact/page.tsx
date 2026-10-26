import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";
import { absoluteUrl, contactEmail } from "@/lib/site";

const description = "Contact Kali Zubaan for questions, feedback, corrections or collaboration requests.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: { title: "Contact | Kali Zubaan", description, url: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <StaticPage title="Contact" intro="We'd love to hear from you.">
      <p>
        For questions, feedback, corrections, or collaboration requests, email us at:
      </p>
      <p className="text-lg font-semibold">
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
      <p>We usually reply within a few working days.</p>
      <h2>Corrections</h2>
      <p>
        If you spot an error in any article, please email us with the article link and the
        correction, and we will review it promptly.
      </p>
    </StaticPage>
  );
}
