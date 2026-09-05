---
name: para-memory-files
description: Recall or maintain an explicitly configured Paperclip PARA memory store.
---

# PARA Memory Files

Use this for prior context or authorised memory updates in a configured Paperclip memory workspace. Verify `$AGENT_HOME` and the host's memory policy before selecting files. Do not create a competing memory store when the host already defines one.

## Recall

Read an entity's `summary.md` first, then relevant `items.yaml` facts when detail is needed. Use the configured `qmd` collection if available; otherwise use local file search. A recall request does not authorise indexing, access-counter updates or other writes.

```sh
qmd search "specific phrase"
qmd query "question about prior context"
```

Check dates and supersession, and distinguish historical notes from current evidence.

## Authorised storage

Write only when the user requests storage or the host explicitly authorises it. Store supported facts and decisions with provenance; do not infer personal facts from examples or unverified output. An authorised memory write does not authorise edits to AGENTS.md, TOOLS.md, skills or host configuration. Propose instruction changes separately unless the current request includes them.

| Store under the verified agent home | Purpose |
|---|---|
| `life/projects/<name>/` | Active work with a goal or deadline |
| `life/areas/people/<name>/` or `life/areas/companies/<name>/` | Continuing responsibilities and relationships |
| `life/resources/<topic>/` | Reference knowledge |
| `life/archives/` | Inactive entities |
| `memory/YYYY-MM-DD.md` | Requested event notes |
| `MEMORY.md` | Confirmed operating preferences |

Entity folders contain `summary.md` and `items.yaml`; `life/index.md` is their index. Create an entity when durable facts justify one. Supersede incorrect facts with `status: superseded` and `superseded_by` rather than silently deleting history.

For authorised fact updates, access tracking, synthesis or archive maintenance, read [the schema and decay rules](references/schemas.md). Weekly synthesis runs only when requested or covered by an existing authorised schedule; this skill does not create a schedule.

## Planning

Keep shared plans in the repository's established location, outside personal memory. Paperclip repository plans belong in `doc/plans/YYYY-MM-DD-slug.md`; another repository's instructions take precedence there. Preserve original plans and mark supersession only within the requested edit scope.
