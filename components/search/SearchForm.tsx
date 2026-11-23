/** Plain GET form to /search: works without JavaScript. */
export default function SearchForm({ defaultValue = "", autoFocus = false, id = "q" }: { defaultValue?: string; autoFocus?: boolean; id?: string }) {
  return (
    <form action="/search" method="get" role="search" className="flex w-full max-w-xl gap-2">
      <label htmlFor={id} className="sr-only">
        Search articles
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        placeholder="Search: SIP, IPO allotment, ITR deadline…"
        enterKeyHint="search"
        maxLength={100}
        className="min-h-12 min-w-0 flex-1 rounded-[var(--radius-md)] border border-line bg-surface px-4 text-base text-ink placeholder:text-muted focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      />
      <button type="submit" className="btn btn-primary min-h-12 px-5">
        Search
      </button>
    </form>
  );
}
