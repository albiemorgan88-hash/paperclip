#!/usr/bin/env bash

# Release-owned version files only. The caller must use a clean, isolated
# checkout with no concurrent work; this is not a general worktree cleaner.
release_state_paths=()
release_new_changelogs=()
release_state_commit=""

capture_release_state() {
  local path changelog
  release_state_commit="$(git -C "$REPO_ROOT" rev-parse HEAD)"
  release_state_paths=()
  release_new_changelogs=()

  while IFS= read -r -d '' path; do
    case "$path" in
      .changeset/*.md|.changeset/pre.json|package.json|pnpm-lock.yaml|CHANGELOG.md|cli/src/index.ts|packages/*/package.json|packages/*/CHANGELOG.md|server/package.json|server/CHANGELOG.md|ui/package.json|ui/CHANGELOG.md|cli/package.json|cli/CHANGELOG.md)
        release_state_paths+=("$path")
        case "$path" in
          package.json|*/package.json)
            changelog="$(dirname "$path")/CHANGELOG.md"
            if [ ! -e "$REPO_ROOT/$changelog" ] && [ ! -L "$REPO_ROOT/$changelog" ]; then
              release_new_changelogs+=("$changelog")
            fi
            ;;
        esac
        ;;
    esac
  done < <(git -C "$REPO_ROOT" ls-files -z)
}

cleanup_release_state() {
  restore_publish_artifacts
  rm -f "$TEMP_CHANGESET_FILE" "$TEMP_PRE_FILE"

  # Never reset every changed file or enumerate/delete all untracked files.
  # Changesets may edit/remove existing version files and create changelogs.
  local path
  # macOS ships Bash 3.2, where an empty array is unbound under `set -u`.
  for path in "${release_state_paths[@]-}"; do
    [ -n "$path" ] || continue
    git -C "$REPO_ROOT" checkout -q "$release_state_commit" -- "$path"
  done
  for path in "${release_new_changelogs[@]-}"; do
    [ -n "$path" ] || continue
    rm -f "$REPO_ROOT/$path"
  done
}
