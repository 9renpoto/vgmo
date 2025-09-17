import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConcertInfo } from "@vgmo/types";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extracts the OGP image URL from a given URL.
 *
 * @param url The URL to fetch and extract the OGP image from.
 * @returns The OGP image URL or null if not found.
 */
export const extractOgpImageUrl = async (
  url: string,
): Promise<string | undefined> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return undefined;
    }
    // The target website uses Shift_JIS encoding.
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("sjis");
    const html = decoder.decode(buffer);
    const $ = cheerio.load(html);
    return $('meta[property="og:image"]').attr("content");
  } catch (error) {
    console.error(`Error fetching OGP image from ${url}:`, error);
    return undefined;
  }
};

/**
 * Parses the date and venue string.
 * e.g. "2025年9月20日(土)＠【東京都】"
 * @param text The text to parse.
 * @returns An object containing the date and venue, or null if parsing fails.
 */
const parseDateAndVenue = (
  text: string,
): { date: string; venue: string } | null => {
  const dateRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
  const dateMatch = text.match(dateRegex);

  if (!dateMatch) {
    return null;
  }

  const [, year, month, day] = dateMatch;
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
  ).toISOString();

  const venueRegex = /【(.*?)】/;
  const venueMatch = text.match(venueRegex);
  const venue = venueMatch ? venueMatch[1] : "Venue not found";

  return { date, venue };
};

/**
 * Scrapes concert information from the concert list page.
 * @param url The URL of the concert list page.
 * @returns A promise that resolves to an array of concert information.
 */
export const scrapeConcertPage = async (
  url: string,
): Promise<ConcertInfo[]> => {
  const concertInfos: ConcertInfo[] = [];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("sjis");
    const html = decoder.decode(buffer);
    const $ = cheerio.load(html);

    const concertPromises: Promise<void>[] = [];

    $("ul#concertlist li").each((_i, el) => {
      const element = $(el);
      const link = element.find("dt a");
      const sourceUrl = link.attr("href");
      const title = link.text().trim();
      const dtText = element.find("dt").text().trim();

      if (!sourceUrl || !title) {
        return; // Skip if essential info is missing
      }

      const dateAndVenue = parseDateAndVenue(dtText);
      if (!dateAndVenue) {
        console.warn(`Could not parse date/venue for: ${title}`);
        return; // Skip if date is not parsable
      }

      const { date, venue } = dateAndVenue;

      const promise = extractOgpImageUrl(sourceUrl).then((imageUrl) => {
        concertInfos.push({
          title,
          date,
          venue,
          ticketUrl: null, // Not available on the list page
          sourceUrl,
          imageUrl,
        });
      });
      concertPromises.push(promise);
    });

    await Promise.all(concertPromises);
  } catch (error) {
    console.error("Error scraping concert page:", error);
  }

  return concertInfos;
};

const concertKey = (concert: ConcertInfo): string =>
  concert.sourceUrl && concert.sourceUrl.length > 0
    ? concert.sourceUrl
    : `${concert.title}-${concert.date}`;

const mergeConcert = (
  previous: ConcertInfo,
  current: ConcertInfo,
): ConcertInfo => ({
  ...previous,
  ...current,
  imageUrl: current.imageUrl ?? previous.imageUrl,
});

export const mergeConcerts = (
  existing: ConcertInfo[],
  incoming: ConcertInfo[],
): ConcertInfo[] => {
  const merged = new Map<string, ConcertInfo>();

  for (const concert of existing) {
    merged.set(concertKey(concert), concert);
  }

  for (const concert of incoming) {
    const key = concertKey(concert);
    const previous = merged.get(key);
    if (previous) {
      merged.set(key, mergeConcert(previous, concert));
    } else {
      merged.set(key, concert);
    }
  }

  return Array.from(merged.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
};

/**
 * Main function to run the crawler.
 */
async function main() {
  const pageUrl = "https://www.2083.jp/concert/";
  console.log(`Scraping concerts from ${pageUrl}...`);

  try {
    const concertInfos = await scrapeConcertPage(pageUrl);
    console.log(`Found ${concertInfos.length} concerts.`);

    const outputPath = resolve(
      __dirname,
      "../../../services/web/public/data/concerts.json",
    );
    let existingConcerts: ConcertInfo[] = [];
    try {
      const previous = await readFile(outputPath, "utf-8");
      existingConcerts = JSON.parse(previous) as ConcertInfo[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn("Failed to read existing concerts.json:", error);
      }
    }

    const mergedConcerts = mergeConcerts(existingConcerts, concertInfos);

    await writeFile(outputPath, JSON.stringify(mergedConcerts, null, 2));

    console.log(
      `Successfully wrote ${mergedConcerts.length} concerts to ${outputPath}`,
    );
  } catch (error) {
    console.error("Error in crawler main function:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
