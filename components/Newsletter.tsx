"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section id="subscribe" className="mt-20 p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white shadow-xl relative overflow-hidden border border-zinc-800 text-center sm:text-left">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="max-w-lg space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
            <Mail className="w-3.5 h-3.5 text-indigo-400" /> Weekly Digest
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
            Stay updated with new articles
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Join our readers getting concise breakdowns of new articles directly delivered to their inbox. No spam, unsubscribe anytime.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          {submitted ? (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>You&apos;re subscribed! We&apos;ll notify you when new articles drop.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 min-w-[240px]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 transition-colors shadow-md"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
