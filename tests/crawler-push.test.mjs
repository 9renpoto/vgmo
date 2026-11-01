import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const script = resolve(".github/scripts/push-crawler-branch.sh");

test("crawler push handles an existing branch and rejects concurrent updates", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "crawler-push-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (cwd, ...args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  git(dir, "init", "--bare", "remote.git");
  git(dir, "init", "local");
  const local = join(dir, "local");
  git(local, "config", "user.name", "Test");
  git(local, "config", "user.email", "test@example.invalid");
  git(local, "remote", "add", "origin", join(dir, "remote.git"));
  git(local, "commit", "--allow-empty", "-m", "initial");
  const initial = git(local, "rev-parse", "HEAD");
  const run = () =>
    spawnSync("bash", [script], {
      cwd: local,
      env: { ...process.env, BRANCH_NAME: "updates" },
      encoding: "utf8",
    });
  assert.equal(run().status, 0);
  assert.equal(
    git(dir, "--git-dir=remote.git", "rev-parse", "refs/heads/updates"),
    initial,
  );
  git(local, "commit", "--allow-empty", "-m", "previous update");
  git(local, "push", "origin", "HEAD:refs/heads/updates");
  git(local, "reset", "--hard", initial);
  git(local, "commit", "--allow-empty", "-m", "generated");
  const generated = git(local, "rev-parse", "HEAD");
  assert.equal(run().status, 0);
  assert.equal(
    git(dir, "--git-dir=remote.git", "rev-parse", "refs/heads/updates"),
    generated,
  );

  git(local, "commit", "--allow-empty", "-m", "next");
  const hooks = join(local, ".git", "hooks");
  mkdirSync(hooks, { recursive: true });
  writeFileSync(
    join(hooks, "pre-push"),
    `#!/bin/sh\ngit --git-dir='${join(dir, "remote.git")}' update-ref refs/heads/updates ${initial}\n`,
    { mode: 0o755 },
  );
  assert.notEqual(run().status, 0);
  assert.equal(
    git(dir, "--git-dir=remote.git", "rev-parse", "refs/heads/updates"),
    initial,
  );
});
