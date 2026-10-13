import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { absoluteUrl, legalLastUpdated } from "@/lib/site";

const description =
  "Disclaimer: Kali Zubaan content is for informational purposes only and is not financial, investment, medical, or health advice.";

export const metadata: Metadata = {
  title: "Disclaimer",
  description,
  alternates: { canonical: absoluteUrl("/disclaimer") },
  openGraph: { title: "Disclaimer | Kali Zubaan", description, url: absoluteUrl("/disclaimer") },
};

export default function DisclaimerPage() {
  return (
    <StaticPage title="Disclaimer" lastUpdated={legalLastUpdated}>
      <p>
        All content on Kali Zubaan is published in good faith for general informational and
        educational purposes only.
      </p>

      <h2>Not financial or investment advice</h2>
      <p>
        Nothing on this Site is financial or investment advice, or a recommendation to buy or sell
        any security or product. Investments involve risk, including loss of capital. Please consult
        a qualified, registered financial advisor before making financial decisions.
      </p>

      <h2>Not medical or health advice</h2>
      <p>
        Nothing on this Site is medical or health advice, and it is not a substitute for
        professional diagnosis or treatment. Always consult a doctor or other qualified health
        professional about any medical condition, and never ignore or delay professional advice
        because of something you read here.
      </p>

      <h2>Accuracy</h2>
      <p>
        We try to keep information accurate and up to date, but we make no guarantees about its
        completeness, reliability or accuracy. Any action you take based on this content is at your
        own risk.
      </p>

      <h2>External links and advertising</h2>
      <p>
        The Site may link to external websites and display third-party advertisements. We do not
        endorse and are not responsible for their content.
      </p>

      <p>If you have questions about this disclaimer, please <Link href="/contact">contact us</Link>.</p>
    </StaticPage>
  );
}
