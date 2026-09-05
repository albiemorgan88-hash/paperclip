Paths in this reference are relative to the Paperclip repository root. Check current source contracts before adapting examples.

## 8. Security Considerations

Adapters sit at the boundary between Paperclip's orchestration layer and arbitrary agent execution. This is a high-risk surface.

### Treat Agent Output as Untrusted

The agent process runs LLM-driven code that reads external files, fetches URLs, and executes tools. Its output may be influenced by prompt injection from the content it processes. The adapter's parse layer is a trust boundary — validate everything, execute nothing.

### Secret Injection via Environment, Not Prompts

Never put secrets (API keys, tokens) into prompt templates or config fields that flow through the LLM. Instead, inject them as environment variables that the agent's tools can read directly:

- `PAPERCLIP_API_KEY` is injected by the server into the process environment, not the prompt
- User-provided secrets in `config.env` are passed as env vars, redacted in `onMeta` logs
- The `redactEnvForLogs()` helper automatically masks any key matching `/(key|token|secret|password|authorization|cookie)/i`

This follows the "sidecar injection" pattern: the model never sees the real secret value, but the tools it invokes can read it from the environment.

### Network Access

If your agent runtime supports network access controls (sandboxing, allowlists), configure them in the adapter:

- Prefer minimal allowlists over open internet access. An agent that only needs to call the Paperclip API and GitHub should not have access to arbitrary hosts.
- Skills + network = amplified risk. A skill that teaches the agent to make HTTP requests combined with unrestricted network access creates an exfiltration path. Constrain one or the other.
- If the runtime supports layered policies (org-level defaults + per-request overrides), wire the org-level policy into the adapter config and let per-agent config narrow further.

### Process Isolation

- CLI-based adapters inherit the server's user permissions. The `cwd` and `env` config determine what the agent process can access on the filesystem.
- `dangerouslySkipPermissions` / `dangerouslyBypassApprovalsAndSandbox` flags exist for development convenience but must be documented as dangerous in `agentConfigurationDoc`. Production deployments should not use them.
- Timeout and grace period (`timeoutSec`, `graceSec`) are safety rails — always enforce them. A runaway agent process without a timeout can consume unbounded resources.

---

## 9. TranscriptEntry Kinds Reference

The UI run viewer displays these entry kinds:

| Kind | Fields | Usage |
|------|--------|-------|
| `init` | `model`, `sessionId` | Agent initialization |
| `assistant` | `text` | Agent text response |
| `thinking` | `text` | Agent reasoning/thinking |
| `user` | `text` | User message |
| `tool_call` | `name`, `input` | Tool invocation |
| `tool_result` | `toolUseId`, `content`, `isError` | Tool result |
| `result` | `text`, `inputTokens`, `outputTokens`, `cachedTokens`, `costUsd`, `subtype`, `isError`, `errors` | Final result with usage |
| `stderr` | `text` | Stderr output |
| `system` | `text` | System messages |
| `stdout` | `text` | Raw stdout fallback |

---

## 10. Testing

Create tests in `server/src/__tests__/<adapter-name>-adapter.test.ts`. Test:

1. **Output parsing** — feed sample stdout through your parser, verify structured output
2. **Unknown session detection** — verify the `is<Agent>UnknownSessionError` function
3. **Config building** — verify `buildConfig` produces correct adapterConfig from form values
4. **Session codec** — verify serialize/deserialize round-trips

---

## 11. Minimal Adapter Checklist

- [ ] `packages/adapters/<name>/package.json` with four exports (`.`, `./server`, `./ui`, `./cli`)
- [ ] Root `index.ts` with `type`, `label`, `models`, `agentConfigurationDoc`
- [ ] `server/execute.ts` implementing `AdapterExecutionContext -> AdapterExecutionResult`
- [ ] `server/test.ts` implementing `AdapterEnvironmentTestContext -> AdapterEnvironmentTestResult`
- [ ] `server/parse.ts` with output parser and unknown-session detector
- [ ] `server/index.ts` exporting `execute`, `testEnvironment`, `sessionCodec`, parse helpers
- [ ] `ui/parse-stdout.ts` with `StdoutLineParser` for the run viewer
- [ ] `ui/build-config.ts` with `CreateConfigValues -> adapterConfig` builder
- [ ] `ui/src/adapters/<name>/config-fields.tsx` React component for agent form
- [ ] `ui/src/adapters/<name>/index.ts` assembling the `UIAdapterModule`
- [ ] `cli/format-event.ts` with terminal formatter
- [ ] `cli/index.ts` exporting the formatter
- [ ] Registered in `server/src/adapters/registry.ts`
- [ ] Registered in `ui/src/adapters/registry.ts`
- [ ] Registered in `cli/src/adapters/registry.ts`
- [ ] Added to workspace in root `pnpm-workspace.yaml` (if not already covered by glob)
- [ ] Tests for parsing, session codec, and config building
