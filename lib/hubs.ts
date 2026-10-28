/**
 * Topic hubs (pillar-cluster pages) at /blog/topics/<slug>.
 *
 * Each hub groups one pillar guide with the shorter posts that support it, so
 * readers and Google see a clear topic structure. Posts are listed by slug, so
 * a hub only changes when someone edits this file. Slugs that aren't published
 * yet are skipped, so a hub can name its pillar before the pillar is live.
 */
export interface TopicHub {
  slug: string;
  name: string;
  /** One or two sentences shown under the hub title and used as the meta description. */
  description: string;
  /** Slug of the long pillar guide, shown first. */
  pillarSlug?: string;
  /** Supporting cluster posts, in display order. */
  postSlugs: string[];
}

export const TOPIC_HUBS: TopicHub[] = [
  {
    slug: "ipo-investing-india",
    name: "IPO Investing in India",
    description:
      "How to apply for an IPO in India, how allotment works for retail investors, what GMP does and does not tell you, and how listing gains are taxed, with plain-English reviews of IPOs as they open.",
    pillarSlug: "how-to-invest-in-ipo-in-india-allotment-gmp-listing-tax",
    postSlugs: [
      "jio-ipo-last-day-5-82x-subscribed-but-retail-only-1-67x-apply",
      "14-985-per-lot-eaaa-ipo-dates-allotment-check-and-gmp-truth",
      "5-ipos-2-581-crore-which-ipo-is-best-to-buy-today-in-india",
      "9-gmp-14-924-a-lot-special-steels-ipo-opens-oct-29",
      "8-gmp-today-is-the-mk-sons-fine-jewels-ipo-worth-14-742",
    ],
  },
];

export function getHub(slug: string): TopicHub | undefined {
  return TOPIC_HUBS.find((hub) => hub.slug === slug);
}

/** The hub a post belongs to (as pillar or cluster post), if any. */
export function getHubForPost(postSlug: string): TopicHub | undefined {
  return TOPIC_HUBS.find((hub) => hub.pillarSlug === postSlug || hub.postSlugs.includes(postSlug));
}
