import assert from "node:assert/strict";
import test from "node:test";
import { fetchFeed } from "../src/main.mjs";

test("fetchFeed fetches and parses the RSS feed", async () => {
  const items = await fetchFeed("https://www.2083.jp/rss.xml");

  assert.ok(Array.isArray(items), "The result should be an array.");
  assert.ok(items.length > 0, "The array of items should not be empty.");

  const item = items[0];
  assert.ok(item.title, "Item should have a title.");
  assert.ok(item.link, "Item should have a link.");
  assert.ok(item.pubDate, "Item should have a pubDate.");
  assert.ok(item.guid, "Item should have a guid.");
  assert.ok(item.pubDate instanceof Date, "pubDate should be a Date object.");
});
