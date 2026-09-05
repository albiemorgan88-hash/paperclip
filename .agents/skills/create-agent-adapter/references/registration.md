Paths in this reference are relative to the Paperclip repository root. Check current source contracts before adapting examples.

## 4. Registration Checklist

After creating the adapter package, register it in all three consumers:

### 4.1 Server Registry (`server/src/adapters/registry.ts`)

```ts
import { execute as myExecute, testEnvironment as myTestEnvironment, sessionCodec as mySessionCodec } from "@paperclipai/adapter-my-agent/server";
import { agentConfigurationDoc as myDoc, models as myModels } from "@paperclipai/adapter-my-agent";

const myAgentAdapter: ServerAdapterModule = {
  type: "my_agent",
  execute: myExecute,
  testEnvironment: myTestEnvironment,
  sessionCodec: mySessionCodec,
  models: myModels,
  supportsLocalAgentJwt: true,  // true if agent can use Paperclip API
  agentConfigurationDoc: myDoc,
};

// Add to the adaptersByType map
const adaptersByType = new Map<string, ServerAdapterModule>(
  [..., myAgentAdapter].map((a) => [a.type, a]),
);
```

### 4.2 UI Registry (`ui/src/adapters/registry.ts`)

```ts
import { myAgentUIAdapter } from "./my-agent";

const adaptersByType = new Map<string, UIAdapterModule>(
  [..., myAgentUIAdapter].map((a) => [a.type, a]),
);
```

With `ui/src/adapters/my-agent/index.ts`:

```ts
import type { UIAdapterModule } from "../types";
import { parseMyAgentStdoutLine } from "@paperclipai/adapter-my-agent/ui";
import { MyAgentConfigFields } from "./config-fields";
import { buildMyAgentConfig } from "@paperclipai/adapter-my-agent/ui";

export const myAgentUIAdapter: UIAdapterModule = {
  type: "my_agent",
  label: "My Agent",
  parseStdoutLine: parseMyAgentStdoutLine,
  ConfigFields: MyAgentConfigFields,
  buildAdapterConfig: buildMyAgentConfig,
};
```

### 4.3 CLI Registry (`cli/src/adapters/registry.ts`)

```ts
import { printMyAgentStreamEvent } from "@paperclipai/adapter-my-agent/cli";

const myAgentCLIAdapter: CLIAdapterModule = {
  type: "my_agent",
  formatStdoutEvent: printMyAgentStreamEvent,
};

// Add to the adaptersByType map
```

---
