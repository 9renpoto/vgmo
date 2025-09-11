import FeedParser from "feedparser";
import { Readable } from "node:stream";

/**
 * Fetches and parses an RSS feed from a given URL.
 *
 * @param {string} url The URL of the RSS feed.
 * @returns {Promise<import("feedparser").Item[]>} A promise that resolves to an array of feed items.
 */
export const fetchFeed = (url) => {
  const items = [];

  return new Promise((resolve, reject) => {
    const feedparser = new FeedParser();

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return reject(new Error(`Failed to fetch feed: ${res.statusText}`));
        }
        // Convert web stream to Node.js stream
        Readable.fromWeb(res.body).pipe(feedparser);
      })
      .catch(reject);

    feedparser.on("error", reject);
    feedparser.on("readable", function () {
      let item;
      while ((item = this.read())) {
        items.push(item);
      }
    });
    feedparser.on("end", () => {
      resolve(items);
    });
  });
};
