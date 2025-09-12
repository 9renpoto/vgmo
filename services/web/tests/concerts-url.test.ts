import assert from "node:assert/strict";
import { constants as fsConstants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/gi, "-")
    .replace(/^-+|-+$/g, "");

test("detail page route file exists", async () => {
  const routePath = join(__dirname, "../src/pages/concert/[slug].astro");
  await access(routePath, fsConstants.R_OK);
});

test("detail page URL format for each concert", async () => {
  const dataPath = join(__dirname, "../public/data/concerts.json");
  const raw = await readFile(dataPath, "utf-8");
  const concerts: Array<{ title: string; date: string }> = JSON.parse(raw);

  assert.ok(Array.isArray(concerts), "concerts.json should be an array");
  assert.ok(concerts.length > 0, "should have at least one concert");

  const slugs = new Set<string>();
  for (const c of concerts) {
    assert.ok(c?.title && c.date, "concert must have title and date");
    const slug = slugify(`${c.date}-${c.title}`);
    assert.ok(slug.length > 0, "slug should not be empty");
    assert.equal(`/concert/${slug}`.startsWith("/concert/"), true);
    assert.equal(slugs.has(slug), false, "slug should be unique");
    slugs.add(slug);
  }
});
