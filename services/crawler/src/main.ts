import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import type { ConcertInfo } from "@vgmo/types";
import * as cheerio from "cheerio";
import FeedParser, { type Item } from "feedparser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Extracts the page image URL from a given URL.
 *
 * @param url The URL to fetch and extract the page image from.
 * @returns The page image URL or null if not found.
 */
export const extractPageImageUrl = async (
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
    const imageUrl = $("#left img").first().attr("src");
    if (imageUrl) {
      return new URL(imageUrl, url).href;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching page image from ${url}:`, error);
    return undefined;
  }
};

/**
 * Extracts concert information from a feed item's description HTML.
 *
 * @param item A feed item from feedparser.
 * @returns Extracted concert information or null if it can't be parsed.
 */
export const extractConcertInfo = async (
  item: Item,
): Promise<ConcertInfo | null> => {
  const $ = cheerio.load(item.description);

  // The title is in a span with the class "concert_title"
  let title = $("span.concert_title").text().trim();

  // Fallback to the first link's text if the span is not found
  if (!title) {
    title = $("a[target='_blank']").first().text().trim();
  }

  // Fallback to the item's title if the above fails, stripping HTML
  if (!title && item.title) {
    title = item.title.replace(/<[^>]*>/g, "").trim();
  }

  if (!title) {
    return null; // Cannot proceed without a title
  }

  // Date parsing
  const dateRegex = /(\d{4})年(\d{1,2})月(\d{1,2})日/;
  const textContent = $.root().text();
  const dateMatch = textContent.match(dateRegex);

  if (!dateMatch) {
    console.warn(`Could not find date for item: ${title}`);
    return null; // Skip if no date found
  }

  const [, year, month, day] = dateMatch;
  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
  ).toISOString();

  // Venue extraction
  let venue = "Venue not found";
  $("b").each((_i, el) => {
    const b = $(el);
    const bText = b.text().trim();
    if (bText.includes("会場") || bText.includes("場所")) {
      const venueLink = b.nextAll("a").first();
      if (venueLink.length > 0) {
        venue = venueLink.text().trim();
        return false; // exit each loop
      }
    }
  });

  // The ticket URL is in an `<a>` tag linking to a ticket vendor.
  let ticketUrl: string | null = null;
  const ticketVendors = [
    "eplus.jp",
    "t.pia.jp",
    "l-tike.com",
    "rakuten-ticket.jp",
    "cnplayguide.com",
    "livepocket.jp",
    "shop.gamecity.ne.jp",
  ];
  $("a").each((_i, el) => {
    const href = $(el).attr("href");
    if (href && ticketVendors.some((vendor) => href.includes(vendor))) {
      ticketUrl = href;
      return false; // exit each loop
    }
  });

  const sourceUrl = item.link ?? "";
  const imageUrl = await extractPageImageUrl(sourceUrl);

  return {
    title,
    date,
    venue,
    ticketUrl,
    sourceUrl,
    imageUrl,
  };
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
 * Fetches and parses an RSS feed from a given URL.
 *
 * @param url The URL of the RSS feed.
 * @returns A promise that resolves to an array of feed items.
 */
export const fetchFeed = (url: string): Promise<Item[]> => {
  const items: Item[] = [];

  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser({});

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return reject(new Error(`Failed to fetch feed: ${res.statusText}`));
        }
        if (!res.body) {
          return reject(new Error("Response body is empty"));
        }
        // Convert web stream to Node.js stream
        const textStream = res.body?.pipeThrough(new TextDecoderStream("sjis"));
        if (textStream) {
          // biome-ignore lint/suspicious/noExplicitAny: DOM and Node.js stream types are incompatible here.
          Readable.fromWeb(textStream as any).pipe(feedparser);
        }
      })
      .catch((err) =>
        reject(err instanceof Error ? err : new Error(String(err))),
      );

    feedparser.on("error", (err) =>
      reject(err instanceof Error ? err : new Error(String(err))),
    );
    feedparser.on("readable", function () {
      let item: Item | null = this.read();
      while (item !== null) {
        items.push(item);
        item = this.read();
      }
    });
    feedparser.on("end", () => {
      resolve(items);
    });
  });
};

/**
 * Main function to run the crawler.
 */
async function main() {
  const feedUrl = "https://www.2083.jp/rss.xml";
  console.log(`Fetching feed from ${feedUrl}...`);

  try {
    const items = await fetchFeed(feedUrl);
    console.log(`Found ${items.length} items.`);

    const concertInfos = (
      await Promise.all(items.map(extractConcertInfo))
    ).filter((info): info is ConcertInfo => info !== null);

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
    console.error("Error fetching or parsing feed:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
