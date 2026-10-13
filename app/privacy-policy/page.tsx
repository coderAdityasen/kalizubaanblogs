import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";
import { absoluteUrl, legalLastUpdated, siteUrl } from "@/lib/site";

const description =
  "Privacy Policy for Kali Zubaan: what data we collect, how cookies and Google advertising cookies are used, and how to opt out.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
  openGraph: { title: "Privacy Policy | Kali Zubaan", description, url: absoluteUrl("/privacy-policy") },
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPage title="Privacy Policy" lastUpdated={legalLastUpdated}>
      <p>
        This Privacy Policy explains how Kali Zubaan (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects,
        uses and protects information when you visit {siteUrl} (the &ldquo;Site&rdquo;). By using
        the Site, you agree to this policy.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Information you give us:</strong> such as your email address if you subscribe to our newsletter or contact us by email.</li>
        <li><strong>Usage information:</strong> such as pages visited, referring site, browser type, device type and approximate location, collected automatically through cookies and similar technologies.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Cookies are small text files stored on your device. We and our partners use cookies to make
        the Site work, understand how it is used, and show advertising. You can block or delete
        cookies in your browser settings, though some features may not work properly.
      </p>

      <h2>Advertising and Google AdSense</h2>
      <ul>
        <li>Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites.</li>
        <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to this Site and/or other sites on the Internet.</li>
        <li>Users may opt out of personalised advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
        <li>You can also opt out of some third-party vendors&apos; use of cookies for personalised advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li>
      </ul>
      <p>
        Learn more about how Google uses data in{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          How Google uses information from sites or apps that use its services
        </a>.
      </p>

      <h2>Analytics</h2>
      <p>
        We use analytics tools (such as Umami) to understand how visitors use the Site, for example
        which pages are popular. This data is aggregated and used only to improve the Site.
      </p>

      <h2>How we use information</h2>
      <ul>
        <li>To operate, maintain and improve the Site.</li>
        <li>To send newsletters you have subscribed to (you can unsubscribe at any time).</li>
        <li>To reply to your messages.</li>
        <li>To show advertising that helps keep the Site free.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Third-party links</h2>
      <p>
        Our articles may link to other websites. We are not responsible for the privacy practices of
        those sites.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example the EU/UK under GDPR, or India under the DPDP Act),
        you may have the right to access, correct or delete your personal data, or withdraw consent.
        To make a request, please <Link href="/contact">contact us</Link>.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>The Site is not directed at children under 13, and we do not knowingly collect their data.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. The &ldquo;Last updated&rdquo; date above shows the latest revision.</p>

      <h2>Contact</h2>
      <p>Questions about this policy? Reach us through our <Link href="/contact">Contact page</Link>.</p>
    </StaticPage>
  );
}
