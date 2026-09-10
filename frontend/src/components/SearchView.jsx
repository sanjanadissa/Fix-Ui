import { DocumentCard } from "./DocumentCard";

// SearchView renders the hero search panel and the filtered document list.
export function SearchView({
  query,
  onQuery,
  project,
  docs,
  loading,
  error,
  onDocClick,
  session,
  onSession,
}) {
  return (
    <>
      {/* hero-panel kept in CSS — glassmorphism + sheen animation */}
      <section className="hero-panel">
        <span className="eyebrow">KNOWLEDGE HUB</span>
        <h1>{query ? `Results for "${query}"` : "What are you looking for?"}</h1>
        <p>Search across docs, READMEs, imported articles and accepted answers.</p>
        <div className="suggestions">
          {["payout retry window", "SSO onboarding", "parser plugin", "refund timeline EU"].map(
            (item) => (
              <button key={item} onClick={() => onQuery(item)}>
                {item}
              </button>
            )
          )}
        </div>
      </section>

      <div className="flex justify-between px-1 text-[rgba(238,240,255,0.6)] text-sm">
        <span>
          {loading ? "Searching..." : `${docs.length} results in `}
          {!loading && <b className="text-[#eef0ff]">{project}</b>}
        </span>
        {/* filter-note kept as class — hidden via @media query at 520px */}
        <span className="filter-note">Current · Outdated · In review</span>
      </div>

      <div className="flex flex-col gap-[10px]">
        {error ? (
          <div className="py-12 px-6 text-center text-[#64748b]">{error}</div>
        ) : (
          docs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onClick={() => onDocClick(doc)}
              session={session}
              onSession={onSession}
            />
          ))
        )}
        {!loading && !error && !docs.length && (
          <div className="py-12 px-6 text-center text-[#64748b]">
            No matching documents found.
          </div>
        )}
      </div>
    </>
  );
}
