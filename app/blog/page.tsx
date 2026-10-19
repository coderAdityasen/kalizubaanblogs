import { BlogArchive, blogArchiveMetadata } from "./archive";

// ISR: serve a cached page, rebuild it in the background at most every 10 minutes.
export const revalidate = 600;

export const metadata = blogArchiveMetadata(1);

export default function BlogPage() {
  return <BlogArchive page={1} />;
}
