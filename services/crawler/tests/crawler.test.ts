import assert from "node:assert/strict";
import test from "node:test";
import type { ConcertInfo } from "@vgmo/types";
import type { Item } from "feedparser";
import { extractConcertInfo, fetchFeed, mergeConcerts } from "../src/main.ts";

test("fetchFeed fetches and parses the RSS feed", async () => {
  const items = await fetchFeed("https://www.2083.jp/rss.xml");

  assert.ok(Array.isArray(items), "The result should be an array.");
  assert.ok(items.length > 0, "The array of items should not be empty.");

  const item = items[0];
  assert.ok(item.title, "Item should have a title.");
  assert.ok(item.link, "Item should have a link.");
  assert.ok(item.pubdate, "Item should have a pubDate.");
  assert.ok(item.guid, "Item should have a guid.");
  assert.ok(item.pubdate instanceof Date, "pubDate should be a Date object.");
});

test("extractConcertInfo should parse HTML and extract concert details", async (t) => {
  t.mock.method(global, "fetch", () => {
    return new Response(
      `<html><head><meta property="og:image" content="http://example.com/ogp.jpg"></head></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    );
  });
  // A mock feedparser item based on the structure of 2083.jp's RSS feed
  const mockItem: Item = {
    title: "Sample Concert Title",
    description: `
      <h3 class="subtitle">公演概要</h3>
      <span class="concert_title">東京シティ・フィルのドラゴンクエスト すぎやまこういち 交響組曲「ドラゴンクエストⅤ」天空の花嫁</span>
      <br><br>
      <b>2025年9月9日(火)</b>
      <br>
      開場：18:00
      <br>
      開演：19:00
      <br><br>
      <b>会場</b>
      <br>
      <a href="http://www.suntory.co.jp/suntoryhall/map/" target="_blank">サントリーホール 大ホール</a>
      <br><br>
      <b>チケット</b>
      <br>
      S席6,000円、A席5,000円、B席4,000円
      <br><br>
      <a href="https://t.pia.jp/pia/event/event.do?eventCd=251234" target="_blank" class="next">チケットぴあでのチケット購入はこちら</a>
      <br><br>
    `,
    link: "http://www.2083.jp/concert/20250909cityphil.html",
    // Other properties are not used by the function, so they can be empty
    summary: "",
    origlink: "",
    date: new Date(),
    pubdate: new Date(),
    author: "",
    guid: "http://www.2083.jp/concert/20250909cityphil.html",
    comments: "",
    image: {
      url: "",
      title: "",
    },
    categories: [],
    enclosures: [],
    meta: {} as Item["meta"],
  };

  const expected: Omit<ConcertInfo, "imageUrl"> & { imageUrl?: string } = {
    title:
      "東京シティ・フィルのドラゴンクエスト すぎやまこういち 交響組曲「ドラゴンクエストⅤ」天空の花嫁",
    date: new Date(2025, 8, 9).toISOString(),
    venue: "サントリーホール 大ホール",
    ticketUrl: "https://t.pia.jp/pia/event/event.do?eventCd=251234",
    sourceUrl: "http://www.2083.jp/concert/20250909cityphil.html",
    imageUrl: "http://example.com/ogp.jpg",
  };

  const result = await extractConcertInfo(mockItem);

  assert.ok(result, "Result should not be null");

  assert.strictEqual(
    result.title,
    expected.title,
    "Title should be extracted correctly",
  );
  assert.strictEqual(
    result.date,
    expected.date,
    "Date should be extracted correctly",
  );
  assert.strictEqual(
    result.venue,
    expected.venue,
    "Venue should be extracted correctly",
  );
  assert.strictEqual(
    result.ticketUrl,
    expected.ticketUrl,
    "Ticket URL should be extracted correctly",
  );
  assert.strictEqual(
    result.sourceUrl,
    expected.sourceUrl,
    "Source URL should be the item's link",
  );
  assert.strictEqual(
    result.imageUrl,
    expected.imageUrl,
    "Image URL should be extracted correctly",
  );
});

test("mergeConcerts accumulates without duplicates", () => {
  const existing: ConcertInfo[] = [
    {
      title: "Existing Concert",
      date: new Date("2024-01-01").toISOString(),
      venue: "Existing Venue",
      ticketUrl: null,
      sourceUrl: "https://example.com/concert/1",
      imageUrl: "https://example.com/image-old.jpg",
    },
  ];

  const incoming: ConcertInfo[] = [
    {
      title: "Existing Concert",
      date: new Date("2024-01-01").toISOString(),
      venue: "Updated Venue",
      ticketUrl: "https://tickets.example.com/1",
      sourceUrl: "https://example.com/concert/1",
      imageUrl: undefined,
    },
    {
      title: "New Concert",
      date: new Date("2024-03-01").toISOString(),
      venue: "New Venue",
      ticketUrl: null,
      sourceUrl: "https://example.com/concert/2",
      imageUrl: "https://example.com/image-new.jpg",
    },
  ];

  const merged = mergeConcerts(existing, incoming);

  assert.equal(merged.length, 2);
  const [first, second] = merged;

  assert.equal(first.sourceUrl, "https://example.com/concert/2");
  assert.equal(second.sourceUrl, "https://example.com/concert/1");
  assert.equal(second.venue, "Updated Venue");
  assert.equal(second.ticketUrl, "https://tickets.example.com/1");
  assert.equal(
    second.imageUrl,
    "https://example.com/image-old.jpg",
    "keeps previous image when new is missing",
  );
});
