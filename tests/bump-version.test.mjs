import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

test("version bump accepts only supported increments and passes tags as data", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "bump-version-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const output = join(dir, "output");
  const args = join(dir, "args");
  writeFileSync(
    join(dir, "docker"),
    '#!/bin/sh\nprintf "%s\\n" "$@" > "$ARGS_FILE"\nprintf "1.2.4\\n"\n',
    { mode: 0o755 },
  );
  const run = (increment, tag) =>
    spawnSync("bash", [resolve(".github/scripts/bump-version.sh")], {
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        GITHUB_OUTPUT: output,
        ARGS_FILE: args,
        SEMVER_INCREMENT: increment,
        PREVIOUS_TAG: tag,
      },
      encoding: "utf8",
    });
  for (const increment of ["major", "minor", "patch"]) {
    assert.equal(run(increment, "v1.2.3").status, 0);
  }
  assert.match(readFileSync(output, "utf8"), /NEW_VERSION=1\.2\.4/);
  const tag = "v1.2.3; $(touch injected)";
  assert.equal(run("patch", tag).status, 0);
  assert.equal(readFileSync(args, "utf8").trim().split("\n").at(-1), tag);
  assert.notEqual(run("patch; echo injected", "v1.2.3").status, 0);
});
