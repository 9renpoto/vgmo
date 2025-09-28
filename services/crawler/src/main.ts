import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConcertInfo } from "@vgmo/types";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extracts the main concert image URL by selecting an <img> inside a <center> element within #left.
 *
 * @param url The URL to fetch and extract the image from.
 * @returns The image URL or undefined if not found.
 */
export const extractConcertImageUrl = async (
  url: string,
): Promise<string | undefined> => {
  const response = await fetch(url);
  if (!response.ok) {
    return undefined;
  }
  // The target website uses Shift_JIS encoding.
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder("sjis");
  const html = decoder.decode(buffer);
  const $ = cheerio.load(html);
  const pageHost = new URL(url).host;
  const centeredImages = $("#left center img");

  for (const element of centeredImages.toArray()) {
    const src = $(element).attr("src");
    if (!src || !URL.canParse(src, url)) {
      if (src) {
        console.warn(`Invalid image URL detected on ${url}:`, src);
      }
      continue;
    }
    const resolvedUrl = new URL(src, url);
    // Prefer images that live on the same domain as the concert page.
    if (resolvedUrl.host === pageHost) {
      return resolvedUrl.href;
    }
  }

  return undefined;
};

/**
 * Extracts the ticket purchase URL by selecting the first <a> inside a .next element within #left.
 *
 * @param url The URL to fetch and extract the ticket link from.
 * @returns The ticket URL or undefined if not found.
 */
export const extractTicketUrl = async (
  url: string,
): Promise<string | undefined> => {
  const response = await fetch(url);
  if (!response.ok) {
    return undefined;
  }
  // The target website uses Shift_JIS encoding.
  const buffer = await response.arrayBuffer();
  const decoder = new TextDecoder("sjis");
  const html = decoder.decode(buffer);
  const $ = cheerio.load(html);

  const finders: Array<() => ReturnType<typeof $>> = [
    () => $("#left .next a").first(),
    () => $("#left a.next"),
    () =>
      $("#left a").filter((_index, element) => {
        const text = $(element).text().trim().toLowerCase();
        return text.includes("チケット") || text.includes("ticket");
      }),
    () => $("#left a[href*='ticket']"),
  ];

  for (const finder of finders) {
    const candidate = finder();
    const href = candidate.attr("href");
    if (!href) {
      continue;
    }

    if (!URL.canParse(href, url)) {
      console.warn(`Invalid ticket URL detected on ${url}:`, href);
      continue;
    }

    return new URL(href, url).href;
  }

  return undefined;
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

    const promise = Promise.all([
      extractConcertImageUrl(sourceUrl),
      extractTicketUrl(sourceUrl),
    ]).then(([imageUrl, ticketUrl]) => {
      concertInfos.push({
        title,
        date,
        venue,
        ticketUrl: ticketUrl ?? null,
        sourceUrl,
        imageUrl,
      });
    });
    concertPromises.push(promise);
  });

  await Promise.all(concertPromises);

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

const readExistingConcerts = async (
  outputPath: string,
): Promise<ConcertInfo[]> => {
  const accessible = await access(outputPath).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    },
  );

  if (!accessible) {
    return [];
  }

  const previous = await readFile(outputPath, "utf-8");
  return JSON.parse(previous) as ConcertInfo[];
};

/**
 * Main function to run the crawler.
 */
async function main() {
  const pageUrl = "https://www.2083.jp/concert/";
  console.log(`Scraping concerts from ${pageUrl}...`);

  const concertInfos = await scrapeConcertPage(pageUrl);
  console.log(`Found ${concertInfos.length} concerts.`);

  const outputPath = resolve(
    __dirname,
    "../../../services/web/public/data/concerts.json",
  );

  const existingConcerts = await readExistingConcerts(outputPath);
  const mergedConcerts = mergeConcerts(existingConcerts, concertInfos);

  await writeFile(outputPath, JSON.stringify(mergedConcerts, null, 2));

  console.log(
    `Successfully wrote ${mergedConcerts.length} concerts to ${outputPath}`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
