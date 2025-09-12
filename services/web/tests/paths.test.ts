import assert from "node:assert/strict";
import test from "node:test";
import { listConcerts } from "../src/utils/concerts.ts";
import { getStaticPaths } from "../src/utils/paths.ts";

test("getStaticPaths exports slugs and props", async () => {
  const [paths, concerts] = await Promise.all([
    getStaticPaths(),
    listConcerts(),
  ]);
  assert.ok(Array.isArray(paths), "paths should be an array");
  assert.equal(paths.length, concerts.length, "paths length matches concerts");
  const expectedSlugs = new Set(concerts.map((c) => c.slug));
  for (const p of paths) {
    assert.ok(p?.params?.slug, "path should have params.slug");
    assert.ok(
      expectedSlugs.has(p.params.slug),
      "slug should exist in concerts",
    );
    assert.ok(p.props?.concert, "props.concert should be present");
    assert.equal(
      p.params.slug,
      p.props.concert.slug,
      "slug matches props.concert.slug",
    );
  }
});
