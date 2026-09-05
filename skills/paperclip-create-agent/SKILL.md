---
name: paperclip-create-agent
description: Draft or submit a Paperclip agent hire when agent creation is requested.
---

# Paperclip Agent Hiring

Separate a hire draft from submission. Reading configuration or preparing a payload does not itself create an agent.

## Prepare the requested hire

Confirm company, reporting line, role and intended work. For live discovery, use the current instance and authorised identity; keep the agent and manager in the same company.

| Need | Endpoint |
|---|---|
| Agent identity | `GET /api/agents/me` |
| Available adapters | `GET /llms/agent-configuration.txt` |
| Selected adapter configuration | `GET /llms/agent-configuration/{adapterType}.txt` |
| Models for that adapter | `GET /api/companies/{companyId}/adapters/{adapterType}/models` |
| Existing company patterns | `GET /api/companies/{companyId}/agent-configurations` |
| Allowed icons | `GET /llms/agent-icons.txt` |

Choose a concrete icon and a role-specific prompt. Honour the requested model; otherwise use a discovered supported model or the adapter's documented default. Preserve requested scheduling, and leave heartbeat and wake-on-demand disabled if neither was requested. State those choices in the draft. Use secret references or the configured environment rather than embedding credentials.

Read [the payload and approval reference](references/api-reference.md) when preparing or submitting the request. Link `sourceIssueId` or `sourceIssueIds` when the hire arose from an issue.

## Submit when authorised

Submission requires board access or `can_create_agents=true` in the company. Missing submission permission does not block preparing a useful draft. A request only to draft ends with the payload; an authorised request to create proceeds through submission and result verification.

Use `POST /api/companies/{companyId}/agent-hires` with the reviewed configuration. This is a mutation: if company approval is disabled, the response can contain `approval: null` and an immediately created `idle` agent. Do not assume the endpoint only saves a draft.

Inspect the response and report the actual agent/approval status. Follow pending approvals when requested or when an approval-resolution heartbeat arrives. For a revised payload, use the existing approval's revision/resubmission flow rather than silently creating a duplicate hire.

## Approval follow-up

Read `GET /api/approvals/{approvalId}` and `GET /api/approvals/{approvalId}/issues`. Close a linked issue only if approval resolves all requested work; otherwise record what remains. Post comments only within the authorised coordination workflow, with the current run ID on issue mutations during heartbeats.

Use company-prefixed UI links, deriving the prefix from the actual issue identifier or company context:

```md
- Approval: [Approval](/<prefix>/approvals/<approval-id>)
- Agent: [Agent](/<prefix>/agents/<agent-url-key-or-id>)
- Source issue: [Issue](/<prefix>/issues/<issue-identifier>)
```

Return the prepared or submitted configuration, confirmed state and any remaining decision. Creating the agent does not imply permission to assign unrelated work, change budgets or start a new recurring schedule.
