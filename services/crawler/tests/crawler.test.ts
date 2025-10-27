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
            <li>
              <dl class="detail">
                <dt>2025年12月28日(日)＠【東京】<br />
                  <a href="https://www.2083.jp/concert/concert-4.html">Concert Four</a>
                </dt>
                <dd>Description four</dd>
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
          `
            <html>
              <body>
                <div id="left">
                  <img src="https://social.example.com/share.jpg" />
                  <center>
                    <img src="https://www.2083.jp/concert/image1.jpg" />
                  </center>
                  <p class="next"><a href="/ticket/1"><span>チケット購入</span></a></p>
                </div>
              </body>
            </html>
          `,
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    }
    if (url.includes("concert-2.html")) {
      return Promise.resolve(
        new Response(
          `
            <html>
              <body>
                <div id="left">
                  <img src="https://social.example.com/share.jpg" />
                  <center>
                    <img src="./image2.jpg" />
                  </center>
                  <p class="next"><a href="https://example.com/ticket/2"><span>チケット購入</span></a></p>
                </div>
              </body>
            </html>
          `,
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    }
    if (url.includes("concert-3.html")) {
      return Promise.resolve(
        new Response(
          `
            <html>
              <body>
                <div id="left">
                  <img src="https://social.example.com/share.jpg" />
                  <center>
                    <img src="https://social.example.com/banner.jpg" />
                  </center>
                </div>
              </body>
            </html>
          `, // No second image available
          { status: 200, headers: { "Content-Type": "text/html" } },
        ),
      );
    }
    if (url.includes("concert-4.html")) {
      return Promise.resolve(
        new Response(
          `
            <html>
              <body>
                <div id="left">
                  <p><a href="https://tickets.example.org/buy/online" target="_blank" class="next">⇒オンラインチケットでのチケット購入はこちら</a></p>
                </div>
              </body>
            </html>
          `,
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

  assert.strictEqual(results.length, 4, "Should find four concerts");

  const concert1 = results.find((c) => c.title === "Concert One");
  assert.ok(concert1, "Concert One should be found");
  assert.strictEqual(concert1.date, new Date(2025, 9, 12).toISOString());
  assert.strictEqual(
    concert1.sourceUrl,
    "https://www.2083.jp/concert/concert-1.html",
  );
  assert.strictEqual(
    concert1.imageUrl,
    "https://www.2083.jp/concert/image1.jpg",
  );
  assert.strictEqual(
    concert1.ticketUrl,
    "https://www.2083.jp/ticket/1",
    "Ticket URL for concert 1 should be correct",
  );

  const concert2 = results.find((c) => c.title === "Concert Two");
  assert.ok(concert2, "Concert Two should be found");
  assert.strictEqual(concert2.date, new Date(2025, 10, 15).toISOString());
  assert.strictEqual(
    concert2.sourceUrl,
    "https://www.2083.jp/concert/concert-2.html",
  );
  assert.strictEqual(
    concert2.imageUrl,
    "https://www.2083.jp/concert/image2.jpg",
  );
  assert.strictEqual(
    concert2.ticketUrl,
    "https://example.com/ticket/2",
    "Ticket URL for concert 2 should be correct",
  );

  const concert3 = results.find((c) => c.title === "Concert Three");
  assert.ok(concert3, "Concert Three should be found");
  assert.strictEqual(
    concert3.imageUrl,
    undefined,
    "Image URL should be undefined for concert 3",
  );
  assert.strictEqual(
    concert3.ticketUrl,
    null,
    "Ticket URL for concert 3 should be null",
  );

  const concert4 = results.find((c) => c.title === "Concert Four");
  assert.ok(concert4, "Concert Four should be found");
  assert.strictEqual(
    concert4.ticketUrl,
    "https://tickets.example.org/buy/online",
    "Ticket URL for concert 4 should pick the external ticket site",
  );
});

test("mergeConcerts accumulates without duplicates", () => {
  const existing: ConcertInfo[] = [
    {
      title: "Existing Concert",
      date: new Date("2024-01-01").toISOString(),
      ticketUrl: null,
      sourceUrl: "https://example.com/concert/1",
      imageUrl: "https://example.com/image-old.jpg",
    },
  ];

  const incoming: ConcertInfo[] = [
    {
      title: "Existing Concert",
      date: new Date("2024-01-01").toISOString(),
      ticketUrl: "https://tickets.example.com/1",
      sourceUrl: "https://example.com/concert/1",
      imageUrl: undefined,
    },
    {
      title: "New Concert",
      date: new Date("2024-03-01").toISOString(),
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
  assert.equal(second.ticketUrl, "https://tickets.example.com/1");
  assert.equal(
    second.imageUrl,
    "https://example.com/image-old.jpg",
    "keeps previous image when new is missing",
  );
});
