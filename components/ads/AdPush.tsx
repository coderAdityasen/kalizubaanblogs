"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Asks AdSense to fill the <ins> rendered just before this component. */
export default function AdPush() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers or a not-yet-loaded script: the reserved box just stays empty.
    }
  }, []);
  return null;
}
