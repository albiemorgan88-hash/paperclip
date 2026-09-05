Paths in this reference are relative to the Paperclip repository root. Check current source contracts before adapting examples.

### 3.4 UI Module

#### `ui/parse-stdout.ts` — Transcript Parser

Converts individual stdout lines into `TranscriptEntry[]` for the run detail viewer. Must handle the agent's streaming output format and produce entries of these kinds:

- `init` — model/session initialization
- `assistant` — agent text responses
- `thinking` — agent thinking/reasoning (if supported)
- `tool_call` — tool invocations with name and input
- `tool_result` — tool results with content and error flag
- `user` — user messages in the conversation
- `result` — final result with usage stats
- `stdout` — fallback for unparseable lines

```ts
export function parseMyAgentStdoutLine(line: string, ts: string): TranscriptEntry[] {
  // Parse JSON line, map to appropriate TranscriptEntry kind(s)
  // Return [{ kind: "stdout", ts, text: line }] as fallback
}
```

#### `ui/build-config.ts` — Config Builder

Converts the UI form's `CreateConfigValues` into the `adapterConfig` JSON blob stored on the agent.

```ts
export function buildMyAgentConfig(v: CreateConfigValues): Record<string, unknown> {
  const ac: Record<string, unknown> = {};
  if (v.cwd) ac.cwd = v.cwd;
  if (v.promptTemplate) ac.promptTemplate = v.promptTemplate;
  if (v.model) ac.model = v.model;
  ac.timeoutSec = 900;  // Use the configured policy; do not disable timeouts implicitly.
  ac.graceSec = 15;
  // ... adapter-specific fields
  return ac;
}
```

#### UI Config Fields Component

Create `ui/src/adapters/<name>/config-fields.tsx` with a React component implementing `AdapterConfigFieldsProps`. This renders adapter-specific form fields in the agent creation/edit form.

Use the shared primitives from `ui/src/components/agent-config-primitives`:
- `Field` — labeled form field wrapper
- `ToggleField` — boolean toggle with label and hint
- `DraftInput` — text input with draft/commit behavior
- `DraftNumberInput` — number input with draft/commit behavior
- `help` — standard hint text for common fields

The component must support both `create` mode (using `values`/`set`) and `edit` mode (using `config`/`eff`/`mark`).

### 3.5 CLI Module

#### `cli/format-event.ts` — Terminal Formatter

Pretty-prints stdout lines for `paperclipai run --watch`. Use `picocolors` for coloring.

```ts
import pc from "picocolors";

export function printMyAgentStreamEvent(raw: string, debug: boolean): void {
  // Parse JSON line from agent stdout
  // Print colored output: blue for system, green for assistant, yellow for tools
  // In debug mode, print unrecognized lines in gray
}
```

---
