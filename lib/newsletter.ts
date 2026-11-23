/**
 * Newsletter sign-ups. Not connected to an email service yet.
 *
 * To connect one, set NEWSLETTER_WEBHOOK_URL in the Vercel project settings
 * (for example a Buttondown, Mailchimp, Zapier/Make or Google Apps Script
 * endpoint). Each sign-up is POSTed there as JSON: { email, source, ts }.
 * For a service with its own API, add a case to subscribe() below.
 * Until something is connected, the form tells readers plainly that sign-ups
 * aren't open yet; it never pretends to have subscribed them.
 */
export type SubscribeResult =
  | { ok: true; message: string }
  | { ok: false; status: number; message: string };

export const NEWSLETTER_NOT_CONNECTED_MESSAGE =
  "Email sign-ups aren't open yet. Until they are, you can follow new posts through the RSS feed.";

export function isNewsletterConnected(): boolean {
  return Boolean(process.env.NEWSLETTER_WEBHOOK_URL);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export async function subscribe(email: string, source: string): Promise<SubscribeResult> {
  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhook) {
    return { ok: false, status: 503, message: NEWSLETTER_NOT_CONNECTED_MESSAGE };
  }
  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, ts: new Date().toISOString() }),
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, status: 502, message: "Sign-up didn't go through. Please try again in a minute." };
    }
    return { ok: true, message: "Thanks! Check your inbox to confirm your subscription." };
  } catch {
    return { ok: false, status: 502, message: "Sign-up didn't go through. Please try again in a minute." };
  }
}
