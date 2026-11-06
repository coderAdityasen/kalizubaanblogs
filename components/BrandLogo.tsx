import Image from "next/image";

const dimensions = {
  genie: { width: 480, height: 480 },
  wordmark: { width: 840, height: 200 },
  lockup: { width: 480, height: 528 },
};

function Genie({ className, priority = false }: { className: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/genie.webp"
      alt=""
      aria-hidden="true"
      {...dimensions.genie}
      className={className}
      priority={priority}
    />
  );
}

/** Official genie and wordmark, with fixed image ratios and a no-JS text fallback. */
export function HeaderBrand() {
  return (
    <span className="relative inline-flex h-12 w-[164px] shrink-0 items-center sm:w-[181px]">
      <Genie className="h-11 w-auto" priority />
      <Image
        src="/brand/wordmark-light.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.wordmark}
        className="ml-2 h-6 w-auto dark:hidden sm:h-7"
        priority
      />
      <Image
        src="/brand/wordmark-dark.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.wordmark}
        className="ml-2 hidden h-6 w-auto dark:block sm:h-7"
        priority
      />
      <noscript>
        <span className="font-serif text-lg font-bold whitespace-nowrap">Kali Zubaan</span>
      </noscript>
    </span>
  );
}

/** Stacked official lockup for About and the 404 page. */
export function BrandLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`block ${className}`}>
      <Image
        src="/brand/logo-light.webp"
        alt="Kali Zubaan"
        {...dimensions.lockup}
        className="h-auto w-full dark:hidden"
      />
      <Image
        src="/brand/logo-dark.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.lockup}
        className="hidden h-auto w-full dark:block"
      />
    </span>
  );
}

/** Genie-only companion to the footer's existing text name. */
export function BrandSymbol() {
  return (
    <span className="inline-flex" aria-hidden="true">
      <Genie className="h-12 w-auto" />
    </span>
  );
}
