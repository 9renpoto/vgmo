import assert from "node:assert/strict";
import test from "node:test";
import type { ConcertInfo } from "@vgmo/types";
import iconv from "iconv-lite";
import { mergeConcerts, scrapeConcertPage } from "../src/main.ts";

test("scrapeConcertPage should parse HTML and extract concert details", async (t) => {
  const mockHtml = `
    <html>
      <head></head>
      <body>
        <div id="concert">
          <ul id="concertlist">
            <li>
              <dl class="detail">
                <dt>2025年10月12日(日)＠【東京】<br />
                  <a href="https://www.2083.jp/concert/concert-1.html">Concert One</a>
                </dt>
                <dd>Description one</dd>
              </dl>
            </li>
            <li>
              <dl class="detail">
                <dt>2025年11月15日(土)＠【大阪】<br />
                  <a href="https://www.2083.jp/concert/concert-2.html">Concert Two</a>
                </dt>
                <dd>Description two</dd>
              </dl>
            </li>
            <li>
              <dl class="detail">
                <dt>2025年12月20日(土)＠Venue not found<br />
                  <a href="https://www.2083.jp/concert/concert-3.html">Concert Three</a>
                </dt>
                <dd>Description three</dd>
              </dl>
            </li>
          </ul>
        </div>
      </body>
    </html>
  `;
  const sjisBuffer = iconv.encode(mockHtml, "sjis");

  // Mock the fetch responses
  t.mock.method(global, "fetch", (url: string) => {
    if (url.includes("concert-1.html")) {
      return Promise.resolve(
        new Response(
          `<html><head><meta property="og:image" content="https://example.com/image1.jpg"></head></html>`,
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    }
    if (url.includes("concert-2.html")) {
      return Promise.resolve(
        new Response(
          `<html><head><meta property="og:image" content="https://example.com/image2.jpg"></head></html>`,
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    }
    if (url.includes("concert-3.html")) {
      return Promise.resolve(
        new Response(
          `<html><head></head></html>`, // No OGP image
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    }
    // The main page fetch
    return Promise.resolve(
      new Response(sjisBuffer, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=sjis" },
      }),
    );
  });

  const results = await scrapeConcertPage("https://www.2083.jp/concert/");

  assert.strictEqual(results.length, 3, "Should find three concerts");

  const concert1 = results.find((c) => c.title === "Concert One");
  assert.ok(concert1, "Concert One should be found");
  assert.strictEqual(concert1.date, new Date("2025-10-12").toISOString());
  assert.strictEqual(concert1.venue, "東京");
  assert.strictEqual(
    concert1.sourceUrl,
    "https://www.2083.jp/concert/concert-1.html",
  );
  assert.strictEqual(concert1.imageUrl, "https://example.com/image1.jpg");

  const concert2 = results.find((c) => c.title === "Concert Two");
  assert.ok(concert2, "Concert Two should be found");
  assert.strictEqual(concert2.date, new Date("2025-11-15").toISOString());
  assert.strictEqual(concert2.venue, "大阪");
  assert.strictEqual(
    concert2.sourceUrl,
    "https://www.2083.jp/concert/concert-2.html",
  );
  assert.strictEqual(concert2.imageUrl, "https://example.com/image2.jpg");

  const concert3 = results.find((c) => c.title === "Concert Three");
  assert.ok(concert3, "Concert Three should be found");
  assert.strictEqual(concert3.venue, "Venue not found");
  assert.strictEqual(
    concert3.imageUrl,
    undefined,
    "Image URL should be undefined for concert 3",
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
