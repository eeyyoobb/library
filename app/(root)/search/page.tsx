import Link from "next/link";
import { RequestBookButton } from "@/components/requestButton";
import { searchBooks } from "@/lib/actions/search";
import BookCover from "@/components/BookCover";
import { Search, BookX, Tag, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.q || "";

  const results = query ? await searchBooks(query) : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
          <Search className="h-7 w-7 text-indigo-400" />
          <span>
            Search Results{" "}
            {query && (
              <span className="text-slate-400">for &quot;{query}&quot;</span>
            )}
          </span>
        </h1>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {results.map((book) => {
            const hasKeywordMatch = book.matchedKeywords.length > 0;
            const hasTopicMatch = book.matchedTopics.length > 0;

            return (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group relative flex overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-xl gap-5"
              >
                {/* Custom 3D Book Cover */}
                <div className="shrink-0 flex items-center justify-center">
                  <BookCover
                    variant="small"
                    coverColor={book.coverColor || "#012B48"}
                    coverImage={book.coverUrl}
                  />
                </div>

                {/* Content Details */}
                <div className="flex flex-1 flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-base font-semibold text-slate-100 line-clamp-2 transition-colors group-hover:text-indigo-400">
                        {book.title}
                      </h2>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-slate-700 bg-slate-800/50 text-[10px] text-slate-300"
                      >
                        {book.category}
                      </Badge>
                    </div>

                    <p className="text-xs font-medium text-slate-400">
                      by <span className="text-slate-300">{book.author}</span>
                    </p>
                  </div>

                  {/* Matched Keywords and Topics */}
                  {(hasKeywordMatch || hasTopicMatch) && (
                    <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-2.5 space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                        Matched Tags
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {book.matchedKeywords.map((kw, idx) => (
                          <Badge
                            key={`kw-${idx}`}
                            className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-[10px] gap-1 px-1.5 py-0.5"
                          >
                            <Tag className="h-2.5 w-2.5 text-indigo-400" />
                            {kw}
                          </Badge>
                        ))}

                        {book.matchedTopics.map((topic, idx) => (
                          <Badge
                            key={`tp-${idx}`}
                            className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[10px] gap-1 px-1.5 py-0.5"
                          >
                            <Hash className="h-2.5 w-2.5 text-emerald-400" />
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 py-16 text-center">
          <BookX className="h-12 w-12 text-slate-600 mb-3" />
          <p className="text-lg text-slate-400 max-w-md">
            {query
              ? `No books found matching "${query}".`
              : "Please enter a search term above."}
          </p>

          {query && (
            <div className="mt-6 space-y-2">
              <p className="text-xs text-slate-500">
                Can't find what you are looking for?
              </p>
              <RequestBookButton query={query} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
