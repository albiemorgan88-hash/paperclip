---
name: release
description: Prepare, rehearse or publish a Paperclip release when a release workflow is requested.
---

# Paperclip Releases

Choose the route from the user's request and existing authority. Establish the requested bump (`patch`, `minor`, `major`), target channel and execution environment. Infer already-specified choices; ask only for a decision that changes the next necessary action. If publication was not requested, prepare a reviewable result.

## Modes

Set `BUMP` below to the agreed bump. Commands run from the Paperclip repository root.

| Mode | Entry command | Effects and completion |
|---|---|---|
| Dry-run plan | `./scripts/release-start.sh "$BUMP" --dry-run` | Fetches remote refs and inspects release state, but creates no branch/worktree and pushes nothing. Finish with the plan and evidence. |
| Local preparation | `./scripts/release-start.sh "$BUMP" --no-push` | Fetches and creates/resumes a release worktree without pushing its branch. Finish with changelog and feasible verification. |
| Live release | [Live release procedure](references/live-release.md) | Use only for the authorised publishing scope. Verify the remote before any push. |

A dry-run command's printed “next steps” can include live commands. They are suggestions, not permission to change modes. Never follow an unqualified publish command from dry-run output.

## Packaging rehearsal

`release-start.sh --dry-run` only plans; packaging rehearsal uses `release.sh --dry-run`, which versions files, builds packages and restores release-managed state. It is not read-only.

Use a clean disposable clone with a dedicated release worktree and no concurrent writes. Do not reuse an active development worktree: `release-start.sh` can return an existing worktree for the release branch. Within that isolated clone, prepare the release train with `--no-push`, enter the returned worktree, and run only the appropriate rehearsal:

```sh
./scripts/release.sh "$BUMP" --canary --dry-run
# Or, for a stable packaging rehearsal:
./scripts/release.sh "$BUMP" --dry-run
```

Stable rehearsal requires the stable changelog. Never append a live release command to a rehearsal block. No npm publish credentials are required by dry-run mode, although package installation and state inspection may need network access. Record any outputs left for inspection; do not remove unrelated files to make the tree look clean.

## Preconditions apply to the action

- Versioning/publishing requires a clean isolated release checkout, the matching `release/X.Y.Z` branch, new commits and an unused target version.
- If manifests changed, the CI-owned lockfile refresh must already be merged on `master` before cutting the release branch. Preserve frozen-lockfile CI behaviour.
- Publish requires local npm rights or the configured trusted-publishing workflow. Missing publish rights does not block drafting or feasible dry-run checks.
- Use `release-changelog` when drafting the stable changelog. If the companion is unavailable, follow `doc/RELEASING.md` and preserve existing manual edits.
- Paperclip issue updates require an actual authorised Paperclip coordination context; a standalone local release does not require creating an issue.

## Invariants and completion

Canaries use the next stable version and increasing ordinals, never a version already stable. Keep `latest` unchanged for canaries, do not create canary changelog files or Git tags, and never republish an already published version. Changelogs remain `releases/vX.Y.Z.md`.

Release candidates need the full verification gate. `release-preflight.sh` already runs it; reuse an unchanged passing result and rerun affected checks after fixes. Continue authorised work through verification; stop a recurring publish failure when progress needs a changed decision or external state. Preserve rollback guidance and report partially completed publication precisely.

Report the version/channel, revision, checks, prepared artifacts and actual npm/Git/GitHub state. Drafts and rehearsals end with their deliverable. Merge, website publication and announcements follow the user's actual authority for those actions.
