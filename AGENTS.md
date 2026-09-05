# AGENTS.md

Guidance for human and AI contributors working in this repository.

## 1. Purpose

Paperclip is a control plane for AI-agent companies.
The current implementation target is V1 and is defined in `doc/SPEC-implementation.md`.

## 2. Read What the Task Needs

- Product behaviour and shared contracts: relevant sections of `doc/SPEC-implementation.md` (the V1 contract).
- Product direction: `doc/GOAL.md` and `doc/PRODUCT.md`; `doc/SPEC.md` is long-horizon context.
- Setup, worktree isolation and local commands: `doc/DEVELOPING.md`.
- Schema or migration changes: `doc/DATABASE.md` and the database workflow below.
- Release preparation or publishing: `doc/RELEASING.md` and `.agents/skills/release/SKILL.md`.

Do not load the whole documentation stack for unrelated or small changes.

## 3. Repo Map

- `server/`: Express REST API and orchestration services
- `ui/`: React + Vite board UI
- `packages/db/`: Drizzle schema, migrations, DB clients
- `packages/shared/`: shared types, constants, validators, API path constants
- `doc/`: operational and product docs

## 4. Local Development

Use `pnpm install` and `pnpm dev` for local setup. The default app serves API and UI on port 3100. Database selection and persistent data paths are documented in `doc/DEVELOPING.md`; use an isolated instance for a worktree and confirm the target before any data reset.

## 5. Core Engineering Rules

1. Keep changes company-scoped.
Every domain entity should be scoped to a company and company boundaries must be enforced in routes/services.

2. Keep contracts synchronized.
If you change schema/API behavior, update all impacted layers:
- `packages/db` schema and exports
- `packages/shared` types/constants/validators
- `server` routes/services
- `ui` API clients and pages

3. Preserve control-plane invariants.
- Single-assignee task model
- Atomic issue checkout semantics
- Approval gates for governed actions
- Budget hard-stop auto-pause behavior
- Activity logging for mutating actions

4. Do not replace strategic docs wholesale unless asked.
Prefer additive updates. Keep `doc/SPEC.md` and `doc/SPEC-implementation.md` aligned.

5. Keep plan docs dated and centralized.
New plan documents belong in `doc/plans/` and should use `YYYY-MM-DD-slug.md` filenames.

## 6. Database Change Workflow

When changing data model:

1. Edit `packages/db/src/schema/*.ts`
2. Ensure new tables are exported from `packages/db/src/schema/index.ts`
3. Generate migration:

```sh
pnpm db:generate
```

4. Validate compile:

```sh
pnpm -r typecheck
```

Notes:
- `packages/db/drizzle.config.ts` reads compiled schema from `dist/schema/*.js`
- `pnpm db:generate` compiles `packages/db` first

## 7. Verification Before Hand-off

Match verification to the change. For documentation or instruction edits, check references, example commands and any changed contracts; a full application build is not required solely for wording changes. For code, run affected checks and broaden when shared behaviour or unresolved failures justify it.

Release candidates and changes spanning shared contracts require the full gate:

```sh
pnpm -r typecheck
pnpm test:run
pnpm build
```

Fix failures caused by the requested change and rerun affected checks. Reuse passing results for an unchanged revision unless new evidence warrants a rerun. If anything cannot be run, report what was not run and why.

## 8. API and Auth Expectations

- Base path: `/api`
- Board access is treated as full-control operator context
- Agent access uses bearer API keys (`agent_api_keys`), hashed at rest
- Agent keys must not access other companies

When adding endpoints:

- apply company access checks
- enforce actor permissions (board vs agent)
- write activity log entries for mutations
- return consistent HTTP errors (`400/401/403/404/409/422/500`)

## 9. UI Expectations

- Keep routes and nav aligned with available API surface
- Use company selection context for company-scoped pages
- Surface failures clearly; do not silently ignore API errors

## 10. Definition of Done

A change is done when all are true:

1. Behavior matches `doc/SPEC-implementation.md`
2. Relevant verification passes; release candidates and shared-contract changes pass the full gate above
3. Contracts are synced across db/shared/server/ui
4. Docs updated when behavior or commands change

For implementation requests, continue through relevant verification and correction of failures caused by the change. Prepare a concrete result before seeking a decision outside the authorised scope. A request for a draft, plan for review or audit ends with that deliverable; planning within an implementation request does not require an automatic review stop.
