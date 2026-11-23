import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/design";

/**
 * Runs before first paint (inline in <head>) so a saved light/dark choice is
 * applied without a flash. With no saved choice and DEFAULT_THEME "system",
 * nothing is set and CSS follows prefers-color-scheme.
 */
export default function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t!=="light"&&t!=="dark"){t=${JSON.stringify(DEFAULT_THEME)};}if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
