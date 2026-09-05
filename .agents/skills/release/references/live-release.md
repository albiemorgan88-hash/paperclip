# Live Paperclip Release

Read this only when publication is authorised. Paths and commands are relative to the verified Paperclip repository/release checkout. Carry the authorised channel, version and scope through every step. Preparation or dry-run intent must not enter this route.

## Step 0 — Release Model

Paperclip now uses this release model:

1. Start or resume `release/X.Y.Z`
2. Draft the **stable** changelog as `releases/vX.Y.Z.md`
3. Publish one or more **prerelease canaries** such as `X.Y.Z-canary.0`
4. Smoke test the canary via Docker
5. Publish the stable version `X.Y.Z`
6. Push the stable branch commit and tag
7. Create the GitHub Release
8. Merge `release/X.Y.Z` back to `master` without squash or rebase
9. Complete website and announcement surfaces

Critical consequence:

- Canaries do **not** use promote-by-dist-tag anymore.
- The changelog remains stable-only. Do not create `releases/vX.Y.Z-canary.N.md`.

## Step 1 — Decide the Stable Version

Start the release train first:

```bash
./scripts/release-start.sh {patch|minor|major}
```

Then run release preflight:

```bash
./scripts/release-preflight.sh canary {patch|minor|major}
# or
./scripts/release-preflight.sh stable {patch|minor|major}
```

Then use the last stable tag as the base:

```bash
LAST_TAG=$(git tag --list 'v*' --sort=-version:refname | rg '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1)
git log "${LAST_TAG}..HEAD" --oneline --no-merges
git diff --name-only "${LAST_TAG}..HEAD" -- packages/db/src/migrations/
git diff "${LAST_TAG}..HEAD" -- packages/db/src/schema/
git log "${LAST_TAG}..HEAD" --format="%s" | rg -n 'BREAKING CHANGE|BREAKING:|^[a-z]+!:' || true
```

Bump policy:

- destructive migrations, removed APIs, breaking config changes -> `major`
- additive migrations or clearly user-visible features -> at least `minor`
- fixes only -> `patch`

If the requested bump is too low, escalate it and explain why.

## Step 2 — Draft the Stable Changelog

Use the available `release-changelog` skill and generate:

- `releases/vX.Y.Z.md`

Rules:

- obtain or reuse explicit approval of the current changelog before publish
- preserve manual edits if the file already exists
- keep the heading and filename stable-only, for example `v1.2.3`
- do not create a separate canary changelog file

## Step 3 — Verify the Release SHA

`release-preflight.sh` already runs typecheck, all tests and build. Reuse its passing result for the unchanged release SHA; rerun affected checks after changes and the full gate before releasing a changed candidate.

If the release will be run through GitHub Actions, the workflow can rerun this gate. Report which revision and environment were verified; avoid redundant local reruns solely to repeat an unchanged passing result.

The GitHub Actions release workflow installs with `pnpm install --frozen-lockfile`. Treat that as a release invariant, not a nuisance: if manifests changed and the lockfile refresh PR has not landed yet, stop and wait for `master` to contain the committed lockfile before shipping.

## Step 4 — Publish a Canary

Run from the `release/X.Y.Z` branch:

If a packaging rehearsal is needed, run the dry-run command in a clean disposable checkout as described in the skill entrypoint. For an authorised live canary:

```bash
./scripts/release.sh {patch|minor|major} --canary
```

What this means:

- npm receives `X.Y.Z-canary.N` under dist-tag `canary`
- `latest` remains unchanged
- no git tag is created
- the script restores release-managed files afterward; use an isolated release checkout without concurrent writes

Guard:

- if the current stable is `0.2.7`, the next patch canary is `0.2.8-canary.0`
- the tooling must never publish `0.2.7-canary.N` after `0.2.7` is already stable

After publish, verify:

```bash
npm view paperclipai@canary version
```

The user install path is:

```bash
npx paperclipai@canary onboard
```

## Step 5 — Smoke Test the Canary

Run:

```bash
PAPERCLIPAI_VERSION=canary ./scripts/docker-onboard-smoke.sh
```

Confirm:

1. install succeeds
2. onboarding completes
3. server boots
4. UI loads
5. basic company/dashboard flow works

If smoke testing fails:

- stop the stable release
- fix failures caused by the release and publish a higher canary only within existing publication authority
- rerun the affected smoke flow; stop if a recurring failure needs a changed decision, permission or unavailable external prerequisite

Each retry should create a higher canary ordinal, while the stable target version can stay the same.

## Step 6 — Publish Stable

Once the SHA is vetted, run:

If needed, rehearse packaging in the disposable checkout first. For authorised stable publication:

```bash
./scripts/release.sh {patch|minor|major}
```

Stable publish does this:

- publishes `X.Y.Z` to npm under `latest`
- creates the local release commit
- creates the local git tag `vX.Y.Z`

Stable publish does **not** push the release for you.

## Step 7 — Push and Create GitHub Release

After stable publish succeeds:

```bash
git push <verified-release-remote> HEAD --follow-tags
./scripts/create-github-release.sh X.Y.Z
```

Use the stable changelog file as the GitHub Release notes source.

Prepare the PR from `release/X.Y.Z` back to `master`. Merge only within explicit merge authority, without squash or rebase so the tag remains reachable.

## Step 8 — Finish the Other Surfaces

Prepare or verify the requested follow-up artifacts for:

- website changelog publishing
- launch post / social announcement
- any release summary in Paperclip issue context

These should reference the stable release, not the canary. Posting announcements, publishing the website or creating tasks requires authority for those actions; prepare drafts and a concrete handoff when that authority is absent.

## Failure Handling

If the canary is bad:

- publish another canary, do not ship stable

If stable npm publish succeeds but push or GitHub release creation fails:

- continue authorised diagnosis and repair from the same release checkout; if the remaining step is blocked, report the exact state
- do not republish the same version

If `latest` is bad after stable publish, prepare the rollback target and run the following only within rollback authority:

```bash
./scripts/rollback-latest.sh <last-good-version>
```

Then fix forward with a new patch release.

## Output

When the skill completes, provide:

- stable version and, if relevant, the final canary version tested
- verification status
- npm status
- git tag / GitHub Release status
- website / announcement follow-up status
- rollback recommendation if anything is still partially complete
