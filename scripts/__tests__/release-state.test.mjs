import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const helper = fileURLToPath(new URL("../release-state.sh", import.meta.url));

for (const existingChangelogs of [false, true]) {
test(`release cleanup preserves unrelated work when changelogs are ${existingChangelogs ? "all existing" : "new"}`, () => {
  const root = mkdtempSync(join(tmpdir(), "paperclip-release-state-"));
  const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
  const git = (...args) => execFileSync("git", args, { cwd: root, env, encoding: "utf8" });
  const write = (path, text) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  write("package.json", '{"private":true}\n');
  write("packages/with space/package.json", '{"version":"1.0.0"}\n');
  write("cli/package.json", '{"version":"1.0.0"}\n');
  write("cli/CHANGELOG.md", "Existing history\n");
  if (existingChangelogs) {
    write("CHANGELOG.md", "Root history\n");
    write("packages/with space/CHANGELOG.md", "Package history\n");
  }
  write(".changeset/feature.md", "Pending changeset\n");
  write("src/work.txt", "Original work\n");
  git("init", "-q");
  git("add", ".");
  git("-c", "user.name=Release test", "-c", "user.email=release-test@example.invalid", "commit", "-qm", "Fixture");

  execFileSync("/bin/bash", ["-c", `
set -euo pipefail
REPO_ROOT="$1"
TEMP_CHANGESET_FILE="$REPO_ROOT/.changeset/release-bump.md"
TEMP_PRE_FILE="$REPO_ROOT/.changeset/pre.json"
source "$2"
restore_publish_artifacts() { :; }
capture_release_state
printf '%s\\n' '{"version":"1.1.0"}' > "$REPO_ROOT/packages/with space/package.json"
printf '%s\\n' 'Generated history' > "$REPO_ROOT/packages/with space/CHANGELOG.md"
printf '%s\\n' 'Updated history' > "$REPO_ROOT/cli/CHANGELOG.md"
printf '%s\\n' 'Unrelated staged work' > "$REPO_ROOT/src/work.txt"
git -C "$REPO_ROOT" add src/work.txt
printf '%s\\n' 'Unrelated notes' > "$REPO_ROOT/notes.txt"
mkdir -p "$REPO_ROOT/scratch"
printf '%s\\n' 'Keep this nested file' > "$REPO_ROOT/scratch/work.txt"
rm "$REPO_ROOT/.changeset/feature.md"
printf '%s\\n' 'Temporary changeset' > "$TEMP_CHANGESET_FILE"
printf '%s\\n' '{}' > "$TEMP_PRE_FILE"
cleanup_release_state
`, "release-state-test", root, helper], { env, encoding: "utf8" });

  assert.equal(readFileSync(join(root, "packages/with space/package.json"), "utf8"), '{"version":"1.0.0"}\n');
  assert.equal(readFileSync(join(root, "cli/CHANGELOG.md"), "utf8"), "Existing history\n");
  assert.equal(readFileSync(join(root, ".changeset/feature.md"), "utf8"), "Pending changeset\n");
  assert.equal(existsSync(join(root, "packages/with space/CHANGELOG.md")), existingChangelogs);
  if (existingChangelogs) {
    assert.equal(readFileSync(join(root, "packages/with space/CHANGELOG.md"), "utf8"), "Package history\n");
    assert.equal(readFileSync(join(root, "CHANGELOG.md"), "utf8"), "Root history\n");
  }
  assert.equal(existsSync(join(root, ".changeset/release-bump.md")), false);
  assert.equal(existsSync(join(root, ".changeset/pre.json")), false);
  assert.equal(git("show", ":src/work.txt"), "Unrelated staged work\n");
  assert.equal(readFileSync(join(root, "notes.txt"), "utf8"), "Unrelated notes\n");
  assert.equal(readFileSync(join(root, "scratch/work.txt"), "utf8"), "Keep this nested file\n");
});
}
