import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = fileURLToPath(new URL("../release-start.sh", import.meta.url));

for (const mode of [
  { name: "default", flags: [], push: true, worktree: true, publishHint: true },
  { name: "dry run", flags: ["--dry-run"], push: false, worktree: false, publishHint: false },
  { name: "local preparation", flags: ["--no-push"], push: false, worktree: true, publishHint: false },
]) {
  test(`release start respects ${mode.name} side effects and next steps`, () => {
    const root = mkdtempSync(join(tmpdir(), "paperclip-release-start-"));
    mkdirSync(join(root, "scripts"));
    mkdirSync(join(root, "bin"));
    copyFileSync(source, join(root, "scripts/release-start.sh"));
    const log = join(root, "calls.log");
    writeFileSync(join(root, "bin/git"), '#!/usr/bin/env bash\nprintf "git %s\\n" "$*" >> "$RELEASE_TEST_CALLS"\n');
    chmodSync(join(root, "bin/git"), 0o755);
    writeFileSync(join(root, "scripts/release-lib.sh"), `
resolve_release_remote(){ printf 'test-remote\\n'; }
fetch_release_remote(){ printf 'fetch %s\\n' "$1" >> "$RELEASE_TEST_CALLS"; }
get_last_stable_tag(){ printf 'v1.2.3\\n'; }
get_current_stable_version(){ printf '1.2.3\\n'; }
compute_bumped_version(){ printf '1.2.4\\n'; }
next_canary_version(){ printf '1.2.4-canary.0\\n'; }
release_branch_name(){ printf 'release/%s\\n' "$1"; }
default_release_worktree_path(){ printf '%s/worktree\\n' "$REPO_ROOT"; }
stable_release_exists_anywhere(){ return 1; }
git_local_branch_exists(){ return 1; }
git_remote_branch_exists(){ return 1; }
git_worktree_path_for_branch(){ return 0; }
path_is_worktree_for_branch(){ return 1; }
release_info(){ printf '%s\\n' "$*"; }
release_warn(){ printf '%s\\n' "$*"; }
release_fail(){ printf '%s\\n' "$*" >&2; exit 1; }
`);
    const output = execFileSync("bash", [join(root, "scripts/release-start.sh"), "patch", ...mode.flags], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${join(root, "bin")}:${process.env.PATH}`, RELEASE_TEST_CALLS: log },
    });
    const calls = readFileSync(log, "utf8");
    assert.equal(/\bpush -u\b/.test(calls), mode.push);
    assert.equal(/\bworktree add\b/.test(calls), mode.worktree);
    assert.equal(output.includes("./scripts/release.sh patch --canary"), mode.publishHint);
    assert.match(calls, /^fetch test-remote/m);
  });
}
