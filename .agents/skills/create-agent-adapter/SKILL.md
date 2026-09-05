---
name: create-agent-adapter
description: Create or change Paperclip runtime adapters and their server, UI and CLI contracts.
---

# Paperclip Agent Adapters

An adapter connects an agent runtime to Paperclip's server, UI and CLI. Repository paths below are relative to the checkout root.

## Source of truth

Use `packages/adapter-utils/src/types.ts` for current interfaces and an existing adapter under `packages/adapters/` with the closest runtime model. Shared adapter metadata must remain usable by all three consumers without Node or React dependencies.

## Required invariants

- Implement `execute` and `testEnvironment` for every server adapter. Environment checks return structured diagnostics; warnings must not become save blockers.
- Preserve company boundaries, run context and audit metadata. Treat output/config as untrusted; validate and record it without executing embedded commands.
- Inject secrets through the configured environment or secret references, and redact logs and metadata.
- Preserve compatible sessions, check the working directory before resume, and clear stale state after a bounded fresh-session retry.
- Honour configured timeouts, cancellation and permission boundaries. Do not silently disable them in example configuration.
- Keep runtime skill injection outside the user's project and preserve existing user skills.

## Read only the relevant detail

| Change | Reference |
|---|---|
| New adapter or contract changes | [Architecture and environment-test contracts](references/contracts.md) |
| Package layout, metadata, execution or parsing | [Package and server implementation](references/package-and-server.md) |
| Config forms, transcript parsing or terminal output | [UI and CLI examples](references/ui-and-cli.md) |
| Registering the adapter with consumers | [Server, UI and CLI registration](references/registration.md) |
| Session reuse, runtime helpers or skill injection | [Sessions and runtime conventions](references/sessions-and-runtime.md) |
| Trust boundaries, isolation or test coverage | [Security, transcript kinds and verification](references/security-and-testing.md) |

For a new adapter, connect all three consumers and validate parsing, environment diagnostics, configuration and session behaviour. For a scoped change, verify the affected contract and behaviour; do not rebuild an unrelated adapter surface.
