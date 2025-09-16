import { readFile } from "node:fs/promises";
import type { ConcertInfo } from "@vgmo/types";

export type ConcertWithMeta = ConcertInfo & {
  slug: string;
  image: string;
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/gi, "-")
    .replace(/^-+|-+$/g, "");

const toMeta = (c: ConcertInfo): ConcertWithMeta => ({
  ...c,
  slug: slugify(`${c.date}-${c.title}`),
  image: c.imageUrl ?? "https://placehold.co/1200x630",
});

const concertKey = (concert: ConcertInfo): string =>
  concert.sourceUrl && concert.sourceUrl.length > 0
    ? concert.sourceUrl
    : `${concert.title}-${concert.date}`;

const normalizeConcerts = (concerts: ConcertInfo[]): ConcertInfo[] => {
  const unique = new Map<string, ConcertInfo>();
  for (const concert of concerts) {
    const key = concertKey(concert);
    if (!unique.has(key)) {
      unique.set(key, concert);
    }
  }
  return Array.from(unique.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
};

export async function loadConcertsFromFile(
  filePath?: string,
): Promise<ConcertWithMeta[]> {
  try {
    const url = filePath
      ? new URL(filePath, import.meta.url)
      : new URL("../../public/data/concerts.json", import.meta.url);
    const text = await readFile(url, "utf-8");
    const raw = JSON.parse(text) as ConcertInfo[];
    return normalizeConcerts(raw).map(toMeta);
  } catch (_e) {
    return [];
  }
}

export async function listConcerts(): Promise<ConcertWithMeta[]> {
  const file = process.env.CONCERTS_JSON ?? undefined;
  return loadConcertsFromFile(file);
}

export async function getConcertBySlug(
  slug: string,
): Promise<ConcertWithMeta | undefined> {
  const all = await listConcerts();
  return all.find((c) => c.slug === slug);
}
