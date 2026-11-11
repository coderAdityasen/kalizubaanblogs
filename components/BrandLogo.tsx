import Image from "next/image";

// Images are served unoptimized (next.config.ts), so the file on disk is exactly
// what browsers download. Header and footer use small copies sized for 2x
// screens (genie shows at 44-48px, wordmark at ~100-120px wide) instead of the
// 480px / 840px masters, which cost ~92 KiB on every page.
const dimensions = {
  genie: { width: 96, height: 96 },
  wordmark: { width: 252, height: 60 },
  lockup: { width: 480, height: 528 },
};

const headerImageProps = { loading: "eager", fetchPriority: "low" } as const;

function Genie({
  className,
  headerSlot = false,
  sizes = "48px",
}: {
  className: string;
  headerSlot?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src="/brand/genie-96.webp"
      alt=""
      aria-hidden="true"
      {...dimensions.genie}
      className={className}
      sizes={sizes}
      {...(headerSlot ? headerImageProps : {})}
    />
  );
}

/**
 * Official genie and wordmark, with fixed image ratios and a no-JS text fallback.
 * They sit above the fold, so they load eagerly, but they are tiny and never the
 * LCP element. `priority` (and React's automatic preload of eager images, which
 * `fetchPriority="low"` opts out of) put three <link rel="preload"> tags in every
 * page's <head>, including the wordmark for the hidden theme, ahead of the post
 * cover that is the real LCP image. The fixed box means no layout shift.
 */
export function HeaderBrand() {
  return (
    <span className="relative inline-flex h-12 w-[164px] shrink-0 items-center sm:w-[181px]">
      <Genie className="h-11 w-auto" sizes="44px" headerSlot />
      <Image
        src="/brand/wordmark-light-252.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.wordmark}
        className="ml-2 h-6 w-auto dark:hidden sm:h-7"
        sizes="(min-width: 640px) 120px, 100px"
        {...headerImageProps}
      />
      <Image
        src="/brand/wordmark-dark-252.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.wordmark}
        className="ml-2 hidden h-6 w-auto dark:block sm:h-7"
        sizes="(min-width: 640px) 120px, 100px"
        {...headerImageProps}
      />
      <noscript>
        <span className="font-serif text-lg font-bold whitespace-nowrap">Kali Zubaan</span>
      </noscript>
    </span>
  );
}

/** Stacked official lockup for About and the 404 page. */
export function BrandLockup({ className = "" }: { className?: string }) {
  // About uses w-44/sm:w-52; 404 uses w-36/sm:w-40 — size to the larger about slot.
  return (
    <span className={`block ${className}`}>
      <Image
        src="/brand/logo-light.webp"
        alt="Kali Zubaan"
        {...dimensions.lockup}
        className="h-auto w-full dark:hidden"
        sizes="(min-width: 640px) 208px, 176px"
      />
      <Image
        src="/brand/logo-dark.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.lockup}
        className="hidden h-auto w-full dark:block"
        sizes="(min-width: 640px) 208px, 176px"
      />
    </span>
  );
}

/** Genie-only companion to the footer's existing text name. */
export function BrandSymbol() {
  return (
    <span className="inline-flex" aria-hidden="true">
      <Genie className="h-12 w-auto" sizes="48px" />
    </span>
  );
}
