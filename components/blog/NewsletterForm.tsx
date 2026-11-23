"use client";

import { useState } from "react";

type State = { kind: "idle" | "sending" | "done" | "info" | "error"; message?: string };

/**
 * Email sign-up. Posts to /api/newsletter; the server decides whether an email
 * service is connected. Shows the server's message as-is: a real confirmation
 * when connected, a neutral "not open yet" note when not.
 */
export default function NewsletterForm({ source, compact = false }: { source: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const inputId = `nl-email-${source}`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company: form.get("company") ?? "" }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) setState({ kind: "done", message: data.message });
      else if (res.status === 503) setState({ kind: "info", message: data.message });
      else setState({ kind: "error", message: data.message || "Something went wrong. Please try again." });
    } catch {
      setState({ kind: "error", message: "You seem to be offline. Please try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate={false}>
      <label htmlFor={inputId} className={compact ? "sr-only" : "mb-2 block text-sm font-medium text-ink"}>
        Email address
      </label>
      <div className={`flex gap-2 ${compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row"}`}>
        <input
          id={inputId}
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 w-full min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 text-[0.9375rem] text-ink placeholder:text-muted focus:border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-brand"
        />
        {/* Honeypot: hidden from people and screen readers. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button type="submit" disabled={state.kind === "sending"} className="btn btn-primary shrink-0 disabled:opacity-60">
          {state.kind === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <p aria-live="polite" className={`mt-2 min-h-5 text-sm ${state.kind === "error" ? "text-red-700 dark:text-red-400" : "text-muted"}`}>
        {state.message ?? (compact ? "" : "One email when something new is worth your time. No spam.")}
      </p>
    </form>
  );
}
