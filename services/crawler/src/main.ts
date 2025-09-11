import { Readable } from "node:stream";
import FeedParser, { type Item } from "feedparser";

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
        Readable.fromWeb(res.body).pipe(feedparser);
      })
      .catch((err) => reject(err instanceof Error ? err : new Error(err)));

    feedparser.on("error", (err) =>
      reject(err instanceof Error ? err : new Error(err)),
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
