import assert from "node:assert/strict";
import test from "node:test";
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
