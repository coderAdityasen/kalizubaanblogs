import type { Metadata } from "next";

/**
 * Google shows roughly the first 600px (about 55-60 characters) of a <title>.
 * The layout template appends " | Kali Zubaan Blog" (19 characters), so on a
 * typical 60-character post headline the brand is cut off and the visible
 * snippet ends in "…". Google already shows the site name above the result
 * (from the WebSite JSON-LD), so for long headlines we use a shorter brand
 * suffix, or none, and keep the headline itself fully visible.
 */
export const TITLE_TAG_MAX = 60;

const FULL_SUFFIX = " | Kali Zubaan Blog";
const SHORT_SUFFIX = " | Kali Zubaan";

export function postTitleTag(title: string): Metadata["title"] {
  const clean = title.trim();
  if (clean.length + FULL_SUFFIX.length <= TITLE_TAG_MAX) {
    // Fits with the layout template ("%s | Kali Zubaan Blog").
    return clean;
  }
  if (clean.length + SHORT_SUFFIX.length <= TITLE_TAG_MAX) {
    return { absolute: `${clean}${SHORT_SUFFIX}` };
  }
  return { absolute: clean };
}
