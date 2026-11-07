import Image from "next/image";

const dimensions = {
  genie: { width: 480, height: 480 },
  wordmark: { width: 840, height: 200 },
  lockup: { width: 480, height: 528 },
};

function Genie({
  className,
  priority = false,
  sizes = "48px",
}: {
  className: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src="/brand/genie.webp"
      alt=""
      aria-hidden="true"
      {...dimensions.genie}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}

/** Official genie and wordmark, with fixed image ratios and a no-JS text fallback. */
export function HeaderBrand() {
  return (
    <span className="relative inline-flex h-12 w-[164px] shrink-0 items-center sm:w-[181px]">
      <Genie className="h-11 w-auto" sizes="44px" priority />
      <Image
        src="/brand/wordmark-light.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.wordmark}
        className="ml-2 h-6 w-auto dark:hidden sm:h-7"
        sizes="(min-width: 640px) 120px, 100px"
        priority
      />
      <Image
        src="/brand/wordmark-dark.webp"
        alt=""
        aria-hidden="true"
        {...dimensions.wordmark}
        className="ml-2 hidden h-6 w-auto dark:block sm:h-7"
        sizes="(min-width: 640px) 120px, 100px"
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
