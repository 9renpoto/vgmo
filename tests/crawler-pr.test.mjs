import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

for (const exists of [false, true]) {
  test(`crawler ${exists ? "updates" : "creates"} a PR without a missing label`, (t) => {
    const workflow = readFileSync(".github/workflows/crawler.yml", "utf8");
    const block = workflow.match(
      /- name: Create or update pull request\n[\s\S]*? {8}run: \|\n([\s\S]*?)(?= {6}- name:)/,
    );
    assert.ok(block);
    const script = block[1].replace(/^ {10}/gm, "");
    const dir = mkdtempSync(join(tmpdir(), "crawler-pr-"));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    const output = join(dir, "calls");
    writeFileSync(
      join(dir, "gh"),
      `#!/bin/bash\nprintf '%s\\n' "$*" >> "$CALLS"\nif [[ "$2" == view ]]; then exit "$VIEW_STATUS"; fi\nfor arg in "$@"; do [[ "$arg" == automated ]] && exit 1; done\nexit 0\n`,
      { mode: 0o755 },
    );
    const result = spawnSync("bash", ["-e", "-c", script], {
      env: {
        ...process.env,
        PATH: `${dir}:${process.env.PATH}`,
        CALLS: output,
        VIEW_STATUS: exists ? "0" : "1",
        BRANCH_NAME: "updates",
        PR_TITLE: "Update",
        PR_BODY: "Generated data",
      },
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(
      readFileSync(output, "utf8"),
      new RegExp(`pr ${exists ? "edit" : "create"} `),
    );
  });
}
