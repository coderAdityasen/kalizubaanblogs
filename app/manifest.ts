import type { MetadataRoute } from "next";

/** Names the installed site Kali Zubaan, not the hosting platform. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kali Zubaan",
    short_name: "Kali Zubaan",
    description: "Money, health, side hustles and tech, explained plainly for India.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
