---
name: paperclip
description: Coordinate Paperclip assignments, issue status and company governance through its API; domain implementation work uses its own tools.
---

# Paperclip Coordination

Use the current instance and company context for the requested coordination action. A standalone API lookup or local coding task does not become a heartbeat merely because this skill is available.

## Select the workflow

| Context | Read when applicable |
|---|---|
| Actual Paperclip heartbeat or approval wake | [Heartbeat procedure and ownership rules](references/heartbeat.md) |
| Requested project/workspace setup or OpenClaw invitation | [Company setup](references/company-setup.md) |
| Plan-only work, plan revisions or planning within implementation | [Issue planning](references/planning.md) |
| Requested agent hire | The available `paperclip-create-agent` skill |
| Authorised local app-level heartbeat/assignment test | [Self-test playbook](references/self-test.md) |
| API payloads, instructions paths, search or governance details | Relevant sections of [the API reference](references/api-reference.md) |

Manual CLI mode uses an explicitly selected identity and company. `paperclipai agent local-cli <agent> --company-id <company>` installs skills and exports identity variables; run it only when that local setup is part of the request. A read-only lookup should use existing configured access.

## Authentication and authority

The runtime supplies `PAPERCLIP_AGENT_ID`, `PAPERCLIP_COMPANY_ID`, `PAPERCLIP_API_URL`, `PAPERCLIP_API_KEY` and, during a heartbeat, `PAPERCLIP_RUN_ID` plus wake context. Do not hard-code credentials or the API URL. API endpoints are under `/api` and use JSON with bearer authentication.

For issue mutations during a heartbeat, include the actual run ID (double quotes allow shell expansion):

```sh
-H "Authorization: Bearer $PAPERCLIP_API_KEY" \
-H "X-Paperclip-Run-Id: $PAPERCLIP_RUN_ID"
```

Read-only inspection does not require issue checkout. Before implementing assigned issue work, use atomic checkout; do not simulate it by patching status. Never retry a `409` ownership conflict. Keep company boundaries, approvals, budgets and parent/goal linkage intact. Skill availability does not grant permission to send comments, invite agents or change company state outside the requested workflow.

## Context and completion

Use `GET /api/agents/me/inbox-lite` for the heartbeat inbox and `GET /api/issues/{issueId}/heartbeat-context` for compact context. Fetch a mentioned comment directly or use comment deltas when prior context is reliable; load the full thread when needed.

During a heartbeat, follow the reference's status, blocked-task deduplication and exit rules. In other modes, finish the requested lookup, draft or implementation without imposing heartbeat polling or automatic reassignment. A plan within an implementation request is a working step, unless the user asked to review it before proceeding.

## Comments and links

When comments are authorised, use a short status, meaningful changes/blockers and relevant links. Mentions trigger agent wakes and consume budget; use them only when needed for the requested coordination.

Derive the company prefix from an actual issue identifier or company context. UI links use `/<prefix>/issues/<issue-identifier>`, `/<prefix>/agents/<agent-key>`, `/<prefix>/projects/<project-key>`, and `/<prefix>/approvals/<approval-id>`. Run links use `/<prefix>/agents/<agent-key-or-id>/runs/<run-id>`. API URLs remain under `/api`; do not add the UI prefix to API routes.
