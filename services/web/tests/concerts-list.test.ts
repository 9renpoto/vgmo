import * as assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadConcertsFromFile } from "../src/utils/concerts.ts";

const FIXTURE_PATH = "../../tests/fixtures/duplicate-concerts.json";

test("loadConcertsFromFile dedupes and sorts concerts", async () => {
  const concerts = await loadConcertsFromFile(FIXTURE_PATH);

  assert.equal(concerts.length, 2, "duplicates should be removed");
  assert.equal(
    concerts[0].title,
    "No Source Concert",
    "oldest concert comes first",
  );
  assert.equal(
    concerts[1].sourceUrl,
    "https://example.com/concert/1",
    "newest concert comes second",
  );
  assert.equal(
    concerts[0].image,
    "https://placehold.co/1200x630",
    "falls back to placeholder when image missing",
  );
  assert.equal(
    concerts[1].image,
    "https://example.com/old.jpg",
    "retains existing image when available",
  );
});

test("loadConcertsFromFile reads default file from cwd public/data", async () => {
  const cwd = process.cwd();
  const workDir = await mkdtemp(join(tmpdir(), "vgmo-web-test-"));
  const dataDir = join(workDir, "public/data");
  const dataPath = join(dataDir, "concerts.json");
  const payload = [
    {
      title: "CWD Concert",
      date: "2099-01-01T00:00:00.000Z",
      ticketUrl: "https://example.com/ticket",
      sourceUrl: "https://example.com/source",
      prefectures: ["東京"],
      imageUrl: "https://example.com/image.jpg",
    },
  ];

  try {
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataPath, JSON.stringify(payload), "utf-8");
    process.chdir(workDir);

    const concerts = await loadConcertsFromFile();
    assert.equal(concerts.length, 1);
    assert.equal(concerts[0].title, "CWD Concert");
    assert.equal(concerts[0].image, "https://example.com/image.jpg");
  } finally {
    process.chdir(cwd);
    await rm(workDir, { recursive: true, force: true });
  }
});
