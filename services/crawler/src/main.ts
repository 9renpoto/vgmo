import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import type { ConcertInfo } from "@vgmo/types";
import * as cheerio from "cheerio";
import FeedParser, { type Item } from "feedparser";

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
    const html = await response.text();
    const $ = cheerio.load(html);
    return $('meta[property="og:image"]').attr("content");
  } catch (error) {
    console.error(`Error fetching OGP image from ${url}:`, error);
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
  const $ = cheerio.load(item.description, { decodeEntities: false });

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

  // The date is often in a `<b>` tag. Let's look for it.
  // Example format: 2025年9月13日(土)
  const dateRegex = /(\d{4}年\d{1,2}月\d{1,2}日\([月火水木金土日]\))/;
  const textContent = $.root().text();
  const dateMatch = textContent.match(dateRegex);
  const date = dateMatch ? dateMatch[0] : "Date not found";

  // The venue is often in a link after a `<b>会場</b>` or `<b>場所</b>` tag.
  let venue = "Venue not found";
  $("b").each((_i, el) => {
    const b = $(el);
    const bText = b.text().trim();
    if (bText.includes("会場") || bText.includes("場所")) {
      // The venue name is often in the next `a` tag's text.
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
  const imageUrl = await extractOgpImageUrl(sourceUrl);

  return {
    title,
    date,
    venue,
    ticketUrl,
    sourceUrl,
    imageUrl,
  };
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

    // Sort by date in descending order and take the latest 3
    const sortedConcerts = concertInfos.sort((a, b) => {
      // A simple string comparison works here because of the YYYY年MM月DD日 format
      return b.date.localeCompare(a.date);
    });
    const latestConcerts = sortedConcerts.slice(0, 3);

    const outputPath = resolve(
      __dirname,
      "../../../services/web/public/data/concerts.json",
    );
    await writeFile(outputPath, JSON.stringify(latestConcerts, null, 2));

    console.log(
      `Successfully wrote ${latestConcerts.length} concerts to ${outputPath}`,
    );
  } catch (error) {
    console.error("Error fetching or parsing feed:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
