import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build, preview } from "astro";
import { chromium } from "playwright";

const expiredConcert = {
  title: "First Concert",
  date: "2099-01-01T00:00:00.000Z",
  imageUrl: "https://example.com/first.jpg",
  sourceUrl: "https://example.com/first",
  ticketUrl: "https://example.com/tickets/first",
};

const upcomingConcert = {
  title: "Second Concert",
  date: "2099-01-03T00:00:00.000Z",
  imageUrl: "https://example.com/second.jpg",
  sourceUrl: "https://example.com/second",
  ticketUrl: "https://example.com/tickets/second",
};

test("the home page retains the correct card details when a concert expires after the build", async (t) => {
  const workDir = await mkdtemp(join(tmpdir(), "vgmo-home-test-"));
  t.after(() => rm(workDir, { recursive: true, force: true }));

  const fixturePath = join(workDir, "concerts.json");
  await writeFile(
    fixturePath,
    JSON.stringify([expiredConcert, upcomingConcert]),
  );
  const previousFixturePath = process.env.CONCERTS_JSON;
  process.env.CONCERTS_JSON = fixturePath;
  const astroConfig = {
    outDir: join(workDir, "dist"),
    server: { host: "127.0.0.1", port: 0 },
    logLevel: "silent",
  } as const;
  try {
    await build(astroConfig);
  } finally {
    if (previousFixturePath === undefined) {
      delete process.env.CONCERTS_JSON;
    } else {
      process.env.CONCERTS_JSON = previousFixturePath;
    }
  }

  const server = await preview(astroConfig);
  t.after(() => server.stop());
  const baseURL = `http://127.0.0.1:${server.port}`;
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ baseURL, timezoneId: "UTC" });
  await page.route("**/*", (route) =>
    new URL(route.request().url()).origin === baseURL
      ? route.continue()
      : route.abort(),
  );
  await page.clock.setFixedTime(new Date("2099-01-02T12:00:00.000Z"));

  const response = await page.goto("/");
  assert.equal(response?.status(), 200);
  const html = await response?.text();
  assert.match(html ?? "", /<h2[^>]*>First Concert<\/h2>/);
  assert.match(html ?? "", /<h2[^>]*>Second Concert<\/h2>/);

  await page.locator("astro-island[ssr]").waitFor({ state: "detached" });
  const cards = page.locator("main .grid > *");
  await cards
    .getByRole("heading", { name: expiredConcert.title })
    .waitFor({ state: "detached" });
  await cards.getByRole("heading", { name: upcomingConcert.title }).waitFor();
  assert.equal(await cards.count(), 1);
  const image = cards.locator('img[alt]:not([alt=""])');
  assert.deepEqual(
    {
      title: await cards.locator("h2").textContent(),
      alt: await image.getAttribute("alt"),
      imageUrl: await image.getAttribute("src"),
      sourceUrl: await cards
        .getByRole("link", { name: "example.com" })
        .getAttribute("href"),
      ticketUrl: await cards
        .getByRole("link", { name: "チケットサイトへ" })
        .getAttribute("href"),
    },
    {
      title: upcomingConcert.title,
      alt: upcomingConcert.title,
      imageUrl: upcomingConcert.imageUrl,
      sourceUrl: upcomingConcert.sourceUrl,
      ticketUrl: upcomingConcert.ticketUrl,
    },
  );
});
