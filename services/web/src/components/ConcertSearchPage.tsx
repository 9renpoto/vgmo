import type { CardProps } from "@vgmo/ui/src/Card";
import Card from "@vgmo/ui/src/Card";
import Header from "@vgmo/ui/src/Header";
import { useEffect, useMemo, useState } from "preact/hooks";
import type { ConcertWithMeta } from "../utils/concerts";

type Props = {
  allConcerts: ConcertWithMeta[];
  initialDayStart: number;
};

const toCardProps = (c: ConcertWithMeta): CardProps => ({
  title: c.title,
  imageUrl: c.image,
  date: new Date(c.date).toLocaleDateString("ja-JP"),
  buttonText: "チケットサイトへ",
  buttonUrl: c.ticketUrl || "",
  sourceName: new URL(c.sourceUrl).hostname,
  sourceUrl: c.sourceUrl,
  prefectures: c.prefectures,
});

export default function ConcertSearchPage({
  allConcerts,
  initialDayStart,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const filteredConcerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) {
      // Keep the initial list aligned with the static HTML during hydration.
      const dayStart = hydrated
        ? new Date().setHours(0, 0, 0, 0)
        : initialDayStart;
      return allConcerts.filter((c) => Date.parse(c.date) >= dayStart);
    }

    // Search across all concerts including past ones
    return allConcerts.filter((c) => {
      const titleMatches = c.title.toLowerCase().includes(q);
      const prefectureMatches = c.prefectures?.some((p) =>
        p.toLowerCase().includes(q),
      );
      return titleMatches || prefectureMatches;
    });
  }, [allConcerts, hydrated, initialDayStart, searchQuery]);

  return (
    <>
      <Header
        active="Home"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div class="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <main class="py-6">
          {filteredConcerts.length === 0 ? (
            <p class="text-center text-gray-500 py-12">
              該当するコンサートが見つかりませんでした。
            </p>
          ) : (
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConcerts.map((c) => (
                <Card key={c.slug} {...toCardProps(c)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
