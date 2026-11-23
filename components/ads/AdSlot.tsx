import AdPush from "./AdPush";

export type AdPlacement = "home" | "in_article" | "article_end" | "listing";

/** Reserved height per placement, so an ad loading in never shifts content (CLS). */
const MIN_HEIGHT: Record<AdPlacement, string> = {
  home: "min-h-[280px] md:min-h-[250px]",
  in_article: "min-h-[300px]",
  article_end: "min-h-[280px]",
  listing: "min-h-[280px] md:min-h-[250px]",
};

export const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";

/**
 * AdSense unit with space reserved up front. Renders nothing until both the
 * publisher id (NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-…) and this placement's slot
 * id (NEXT_PUBLIC_ADSENSE_SLOT_<PLACEMENT>) are set, so reviewers never see
 * empty boxes before approval.
 */
/** True when this placement would render (publisher id and slot id both set). */
export function adSlotEnabled(placement: AdPlacement): boolean {
  return Boolean(adsenseClient && process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${placement.toUpperCase()}`]);
}

export default function AdSlot({ placement, className = "" }: { placement: AdPlacement; className?: string }) {
  const slot = process.env[`NEXT_PUBLIC_ADSENSE_SLOT_${placement.toUpperCase()}`];
  if (!adsenseClient || !slot) return null;
  return (
    <aside aria-label="Advertisement" className={`my-10 ${className}`}>
      <p className="kicker mb-2 text-center text-muted">Advertisement</p>
      <div className={`${MIN_HEIGHT[placement]} overflow-hidden rounded-[var(--radius-lg)] bg-surface-2`}>
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={adsenseClient}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <AdPush />
      </div>
    </aside>
  );
}
