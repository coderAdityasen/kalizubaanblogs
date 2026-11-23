/** Dates are shown in India time so a late-night IST post doesn't show the previous day. */
export function formatDate(iso: string, style: "short" | "long" = "short"): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
