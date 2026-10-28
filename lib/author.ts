import { authorName, authorPagePath } from "@/lib/site";

/**
 * Everything the author page (/author/aditya-sen) and the Person structured
 * data say about the author. Only verifiable facts belong here.
 *
 * TO BE FILLED BY ADITYA: every field marked "TODO(Aditya)" is empty on
 * purpose. Empty fields are hidden on the live site; in `npm run dev` they show
 * as yellow placeholder boxes so you can see what is missing. Never put a
 * credential here that you cannot prove (YMYL: Google's raters check).
 */
export const author = {
  name: authorName,
  path: authorPagePath,
  /** Taken from the About page. */
  jobTitle: "Software Developer",
  location: "Indore, India",
  shortBio:
    "Software developer based in Indore, India. I build web applications with JavaScript, Node.js and the MERN stack, work with AI tools every day, and write Kali Zubaan's plain-English explainers on money, health, side hustles and tech.",
  githubUrl: "https://github.com/coderAdityasen",

  // TODO(Aditya): full profile URLs, e.g. "https://www.linkedin.com/in/<you>/".
  linkedinUrl: "",
  // TODO(Aditya): e.g. "https://x.com/<you>".
  xUrl: "",
  // TODO(Aditya): a real photo of you, e.g. "/aditya-sen.jpg" in /public (square, 400x400 or larger).
  photo: "",
  // TODO(Aditya): only real, checkable credentials: degrees, certifications
  // (e.g. NISM series, with certificate number), years of investing or work
  // experience in finance, SEBI registration number if you have one.
  credentials: [] as string[],
  // TODO(Aditya): your own first-hand experience with these topics, in your
  // words (e.g. "I have applied for N IPOs since 20XX"). Experience is the
  // first "E" in E-E-A-T.
  experience: "",
  // TODO(Aditya): a named expert who reviews finance posts (name, qualification,
  // registration number, profile URL). Leave empty until someone has agreed.
  financeReviewer: null as null | { name: string; credential: string; url?: string },
};

export const authorSameAs = [author.githubUrl, author.linkedinUrl, author.xUrl].filter(Boolean);
