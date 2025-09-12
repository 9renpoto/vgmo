import assert from "node:assert/strict";
import test from "node:test";
import config from "../astro.config.mjs";

test("astro.config includes preact integration", () => {
  assert.ok(
    Array.isArray(config.integrations),
    "integrations should be an array",
  );
  const hasPreact = config.integrations.some(
    (i: any) => i && i.name === "@astrojs/preact",
  );
  assert.equal(hasPreact, true, "preact integration should be present");
});
