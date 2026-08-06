# Agentic coding configuration in VS Code (GitHub Copilot) — file-layout contract

**Researched:** 2026-08-06. **Current VS Code version: 1.132 (August 2026, released 2026-08-05).**
All VS Code doc pages cited were stamped **8/5/2026** or **7/31/2026** unless noted.

> **Docs moved.** The customization docs now live under two URL trees that serve identical content:
> `https://code.visualstudio.com/docs/agent-customization/*` (current canonical) and
> `https://code.visualstudio.com/docs/agents/*` (concepts/overview).
> The older `https://code.visualstudio.com/docs/copilot/customization/*` paths still resolve to the same
> pages. This document cites the `agent-customization` / `agents` paths where known.

---

## 1. Summary table — file path → what it does → status

| Path / pattern | What it does | Auto-applied? | Status (v1.132, Aug 2026) | Shipped |
|---|---|---|---|---|
| `AGENTS.md` (workspace root) | Always-on custom instructions | Yes (`chat.useAgentsMdFile`, default `true`) | **Stable / GA** | v1.104 exp → **GA v1.105** |
| `**/AGENTS.md` (subfolders) | Nested/monorepo instructions | Only if `chat.useNestedAgentsMdFiles` = `true` | **Experimental**, default off | v1.105, still experimental |
| `.github/copilot-instructions.md` | Always-on workspace instructions | Yes | **Stable, NOT deprecated** | long-standing |
| `CLAUDE.md` (root, `.claude/`, home) | Always-on instructions, Claude-tool compatible | Yes (`chat.useClaudeMdFile`, default `true`) | Stable | — |
| `.github/instructions/*.instructions.md` | Scoped instructions via `applyTo` glob | Yes, when a matching file is in context | **Stable** | — |
| `~/.copilot/instructions/*.instructions.md`, `~/.claude/rules/*` | User-level scoped instructions | Yes (`~/.claude/rules` default `false`) | Stable | — |
| `.github/skills/<name>/SKILL.md` | **Agent Skills** — progressive-disclosure capability bundles | Model-invoked by description; also `/name` | **Stable / GA** (`chat.useAgentSkills` default `true`) | v1.108 exp → **GA v1.109** |
| `.claude/skills/<name>/SKILL.md` | Same, Claude-compatible location | Yes (default location) | Stable | v1.108 |
| `.agents/skills/<name>/SKILL.md` | Same, tool-agnostic location | Documented, not in setting default | Stable | — |
| `.github/agents/*.agent.md` | **Custom agents** (formerly custom chat modes) | User-selected from dropdown, or as subagent | **Stable** | renamed **v1.106** |
| `.claude/agents/*.md` | Claude sub-agent format, read by VS Code | Same | Stable | — |
| `.github/chatmodes/*.chatmode.md` | **Legacy** custom chat modes | Still auto-treated as custom agents | **Legacy-supported, no formal deprecation**; migrate | pre-v1.106 |
| `.github/prompts/*.prompt.md` | Reusable prompts invoked as `/name` | User-invoked only | Stable, but **Local harness only** | — |
| `.vscode/mcp.json` | MCP server config (workspace) | Yes | **Stable** | — |
| `.mcp.json` (workspace root) | MCP config, Claude Code format — Agent Host only | Agent Host harness only | Stable | — |
| `.github/hooks/*.json` | Agent lifecycle hooks | Yes (`chat.hooks.enabled`) | **Preview** | v1.109 |
| `.claude/settings.json`, `.claude/settings.local.json` | Hooks in Claude format | Yes | Preview | v1.109 |
| `hooks:` in `*.agent.md` frontmatter | Agent-scoped hooks (`chat.useCustomAgentHooks`) | Only for that agent | **Preview** | v1.111 |
| `plugin.json` (+ `skills/`, `agents/`, `hooks/`, `.mcp.json`) | **Agent plugins** bundle | Installed from marketplace | **Preview** | v1.110 |
| `.vscode/settings.json` | Team-committed agent settings | — | Mixed (see §9) |  |

---

## 2. `AGENTS.md`

**Yes, VS Code reads it.** It is one of the "always-on" instruction file types.

**Version history:** introduced **v1.104 (Aug 2025)** as experimental —
> "An `AGENTS.md` file lets you provide context and instructions to the agent. Starting from this release, when you have an `AGENTS.md` file in your workspace root(s), it is automatically picked up as context for chat requests." — https://code.visualstudio.com/updates/v1_104

Promoted to GA in **v1.105 (Sep 2025)** —
> "Last milestone, we introduced support for `AGENTS.md` at the root of your workspace. This functionality is now generally available and enabled by default." — https://code.visualstudio.com/updates/v1_105

Nested support arrived in the same v1.105 release and **is still experimental as of v1.132** —
> "We now also added support for nested `AGENTS.md` files in subfolders of your workspace. This enables you to provide more specific context and instructions for different parts of your codebase."

- **Location:** workspace root by default. Doc: *"VS Code automatically detects an `AGENTS.md` Markdown file in the root of your workspace"*.
- **Nested / monorepo:** off by default. Enable `chat.useNestedAgentsMdFiles` (**Experimental**, default `false`) — *"When enabled, VS Code searches recursively in all subfolders of your workspace for `AGENTS.md` files"*.
- **Parent repos (monorepo/submodule):** `chat.useCustomizationsInParentRepositories` (default `false`) enables discovery of customizations in parent repository folders.
- **Master switch:** `chat.useAgentsMdFile`, default `true` — *"Enable or disable using `AGENTS.md` files as context for chat requests."*
- **No frontmatter.** `AGENTS.md` is plain Markdown; the `applyTo`/`name` frontmatter belongs to `*.instructions.md` only.

### Interaction with `.github/copilot-instructions.md` — which wins?

**Neither. They are combined, not ranked.** VS Code doc:

> "If you have multiple instruction files in your project, VS Code combines and adds them to the chat context, no specific order is guaranteed."

Both sit at the same **repository** tier. The only documented ranking is across *scopes*:

1. **Personal** (user-level) instructions — highest
2. **Repository** instructions (`.github/copilot-instructions.md`, `AGENTS.md`, `.instructions.md`)
3. **Organization** instructions — lowest

GitHub's docs give a finer within-repository ordering for GitHub-side Copilot:

> "Personal instructions take the highest priority. Repository instructions come next, and then organization instructions are prioritized last."

with repository instructions ordered: path-specific `.github/instructions/**/*.instructions.md` → repo-wide `.github/copilot-instructions.md` → agent instruction files (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`).

> ⚠️ **Conflict flagged:** VS Code says "no specific order is guaranteed" for combining; GitHub.com states an explicit three-step ordering *within* repository instructions. See §11.

**Practical rule:** do not rely on one file overriding another. Put a rule in exactly one place.

**Sources:**
- https://code.visualstudio.com/docs/agent-customization/custom-instructions
- https://code.visualstudio.com/docs/copilot/reference/copilot-settings
- https://docs.github.com/en/copilot/concepts/response-customization

---

## 3. `.github/copilot-instructions.md`

**Not deprecated.** Verified against the "Deprecated features and settings" sections of the v1.126, v1.131 and v1.132 release notes — **no deprecation of `copilot-instructions.md` appears anywhere through v1.132**. It is still documented as a first-class always-on instruction file in both the VS Code docs and GitHub's docs, and v1.112 release notes list it alongside `AGENTS.md` and `CLAUDE.md` as an always-on instruction type.

(The only nearby removals in this area: settings-based code/test-generation instructions deprecated in **v1.102**, and built-in **Edit mode** deprecated in **v1.110** and fully removed in **v1.126**.)

> "VS Code automatically detects a `.github/copilot-instructions.md` Markdown file in the root of your workspace and applies the instructions in this file to all chat requests within this workspace."

- Single file, workspace-level, no frontmatter.
- Broadest tool support: GitHub docs note that agent instruction files (`AGENTS.md`/`CLAUDE.md`/`GEMINI.md`) *"are currently not supported by all Copilot features"*, whereas `copilot-instructions.md` is documented across every environment section. **If you need maximum coverage across Copilot surfaces (code review, cloud agent, github.com chat), `.github/copilot-instructions.md` is still the safest file.**

**What *is* deprecated** is the *settings-based* form of instructions:

> "Settings-based code generation and test generation instructions are deprecated as of VS Code 1.102. Use file-based instructions instead."

i.e. `github.copilot.chat.codeGeneration.instructions` and `github.copilot.chat.testGeneration.instructions` are deprecated. Still supported (as settings) for scenarios with no file equivalent:

- `github.copilot.chat.reviewSelection.instructions` (Preview)
- `github.copilot.chat.commitMessageGeneration.instructions` (Experimental)
- `github.copilot.chat.pullRequestDescriptionGeneration.instructions` (Experimental)

These take an array of objects with either a `text` property (inline) or a `file` property (path to a Markdown file):

```jsonc
// .vscode/settings.json
{
  "github.copilot.chat.commitMessageGeneration.instructions": [
    { "text": "Use Conventional Commits. Subject line under 72 chars." },
    { "file": "docs/commit-style.md" }
  ]
}
```

**Sources:** https://code.visualstudio.com/docs/agent-customization/custom-instructions , https://docs.github.com/en/copilot/concepts/response-customization

---

## 4. `*.instructions.md` — scoped instructions

**Locations searched (recursively):**

| Scope | Default location | Default enabled |
|---|---|---|
| Workspace | `.github/instructions/` | `true` |
| User profile | `~/.copilot/instructions/` | `true` |
| User (Claude format) | `~/.claude/rules/` | `false` |

Configured via `chat.instructionsFilesLocations`, whose default is:

```jsonc
{ ".github/instructions": true, "~/.claude/rules": false }
```

> "Locations to search for custom instructions files. Each folder is searched recursively."

**Filename pattern:** `*.instructions.md` (e.g. `react.instructions.md`).

**Frontmatter (all optional):**

| Field | Purpose |
|---|---|
| `name` | Display name in UI; defaults to filename |
| `description` | Shown on hover in the Chat view |
| `applyTo` | Glob deciding which files auto-trigger these instructions |

**Full example:**

```markdown
---
name: 'Python Standards'
description: 'Coding conventions for Python files'
applyTo: '**/*.py'
---
# Python coding standards

- Follow the PEP 8 style guide.
- Use type hints for all function signatures.
- Write docstrings for public functions.
- Use 4 spaces for indentation.
```

**`applyTo` semantics:**

- *"Glob pattern that defines which files the instructions apply to automatically, relative to the workspace root. Use `**` to apply to all files."*
- Multiple patterns are **comma-separated inside one string**: `applyTo: '**/*.ts,**/*.tsx'`
- **If `applyTo` is omitted**, the instructions are *not* applied automatically — you must attach them manually to a chat request.
- Auto-attachment is governed by `chat.includeApplyingInstructions` (default `true`): *"Automatically add instruction files with a matching `applyTo` pattern to chat requests."*

**Cross-referencing:** instruction files can link other files with plain Markdown links, e.g. `[general coding guidelines](./general-coding.instructions.md)`. Whether those links are auto-pulled into context is controlled by `chat.includeReferencedInstructions` (default **`false`**).

**Source:** https://code.visualstudio.com/docs/agent-customization/custom-instructions

---

## 5. Prompt files — `.github/prompts/*.prompt.md`

**Locations:**

| Scope | Default location |
|---|---|
| Workspace | `.github/prompts/` |
| User | VS Code profile user data directory (or `~/.copilot/prompts` under Agent Host) |

Extra folders via `chat.promptFilesLocations`, default `{ ".github/prompts": true }`.

**Frontmatter (all optional):**

| Field | Purpose |
|---|---|
| `description` | Short explanation of what the prompt does |
| `name` | Name shown after typing `/`; defaults to filename |
| `argument-hint` | Hint text shown in the chat input |
| `agent` | Which agent to run in: `ask`, `agent`, `plan`, or a custom agent name |
| `model` | Language model; falls back to the current model picker selection |
| `tools` | List of tool / tool-set names; supports `<server-name>/*` for all tools of an MCP server |

> **Note:** the field is `agent:` in current docs. Older docs/blogs use `mode:` (`ask`/`edit`/`agent`). Treat `mode` as the legacy spelling — see §11.

**Verbatim example from the docs:**

```markdown
---
agent: 'agent'
model: GPT-4o
tools: ['search/codebase', 'vscode/askQuestions']
description: 'Generate a new React form component'
---
Your goal is to generate a new React form component based on the templates in the Github repo contoso/react-templates.
```

**How a user invokes one:**

- Type `/` in chat followed by the prompt name — e.g. `/create-react-form`
- Command palette: **Chat: Run Prompt**
- The play button in the prompt file's editor toolbar

**Arguments / input variables — yes:**

- Free-form extra text after the slash command: *"You can add extra information in the chat input field. For example, `/create-react-form formName=MyForm` or `/create-api for listing customers`."*
- Body variables documented: `${selection}`, `${input:variableName}`, `${input:variableName:placeholder}`
- Tool references in the body use `#tool:<tool-name>`
- Other files can be referenced with relative Markdown links

> ⚠️ The current prompt-files page does **not** enumerate `${workspaceFolder}`, `${file}`, or `$ARGUMENTS`. Some of these existed in earlier versions of the docs. Unconfirmed — see §11.

**Big caveat — harness limitation:**

> "Agents running on the Agent Host don't use prompt files. To use an existing prompt with the Copilot agent, convert it to an agent skill."

Prompt files only work in the **Local** harness. Since VS Code now offers multiple harnesses (Local, Copilot/Agent Host, Claude, Codex, Cloud), **a team repo that wants slash commands to work everywhere should author Agent Skills instead of prompt files.** VS Code ships a one-time migration: enable `chat.customizations.promptMigration.enabled` (**Experimental**) and use "Migrate Prompts" in the AI Customizations editor.

**Other settings:** `chat.promptFilesRecommendations` (default `[]`) — show prompts as recommended actions at the start of a new chat session.

> `chat.promptFiles` (a boolean master switch) was the enabling setting in earlier releases (~1.97–1.104). It no longer appears in the current settings reference — prompt files are on by default now. See §11.

**Source:** https://code.visualstudio.com/docs/agent-customization/prompt-files

---

## 6. Custom agents — `*.agent.md` (formerly `*.chatmode.md`)

**`*.chatmode.md` was renamed to `*.agent.md` in v1.106 (Oct 2025).**

> "Chat modes have been renamed to custom agents throughout VS Code to better align with terminology used in other environments."
>
> "When you create custom agents, the definition files are now located in `.github/agents` in your workspace." — https://code.visualstudio.com/updates/v1_106

**`.chatmode.md` is NOT formally deprecated.** No release notes' "Deprecated features and settings" section through v1.132 mentions it. The v1.106 notes say:

> "If you have existing custom chat modes (`.chatmode.md` files in `.github/chatmodes`), they continue to work and are automatically treated as custom agents."
>
> "When you open a chat agent file in the editor, an info marker appears on the first line with a quick fix to migrate it to a custom agent file."

The current docs page pushes migration harder:

> "Custom agents were previously known as custom chat modes. The functionality remains the same, but the terminology has been updated to better reflect their purpose."
>
> "If you have existing `.chatmode.md` files, rename them to `.agent.md` to convert them to the new custom agent format and place them in the appropriate location to continue using them."

**Net:** legacy-supported with an in-editor migration quick fix; migrate anyway. See §11 for the docs-vs-release-notes wording conflict.

**Locations:**

| Scope | Default location |
|---|---|
| Workspace | `.github/agents/` |
| Workspace (Claude format) | `.claude/agents/` (plain `*.md`) |
| User profile | `~/.copilot/agents/` |

Extra folders via `chat.agentFilesLocations`, default `{ ".github/agents": true }`.

> "VS Code also detects `.md` files in the `.claude/agents` folder, following the Claude sub-agents format. This enables you to use the same agent definitions across VS Code and Claude Code."

**Frontmatter:**

| Field | Description |
|---|---|
| `name` | Agent name; defaults to filename |
| `description` | Shown as placeholder text in the chat input |
| `argument-hint` | Hint text guiding how to interact with the agent |
| `tools` | List of tool or tool-set names available to this agent |
| `agents` | List of agent names available as **subagents** |
| `model` | Model to use — string, or a prioritized array |
| `user-invocable` | Show in the agents dropdown (default `true`) |
| `disable-model-invocation` | Prevent invocation as a subagent by other agents (default `false`) |
| `target` | Target environment: `vscode` or `github-copilot` |
| `handoffs` | Suggested next actions / transitions to other agents |
| `hooks` | Inline hook definitions scoped to this agent (Preview) |

**Verbatim example:**

```markdown
---
description: Generate an implementation plan for new features or refactoring existing code.
name: Planner
tools: ['web/fetch', 'search/codebase', 'search/usages']
model: ['Claude Opus 4.5', 'GPT-5.2']
handoffs:
  - label: Implement Plan
    agent: agent
    prompt: Implement the plan outlined above.
    send: false
---
# Planning instructions

You are in planning mode. Your task is to generate an implementation plan for a new feature or for refactoring existing code.
Don't make any code edits, just generate a plan.
```

**Invocation:** select the custom agent from the agents dropdown in the Chat view. Agents listed in another agent's `agents:` field can be invoked as subagents by the model.

**Status:** stable feature; agent **hooks** within the frontmatter are Preview.

**Source:** https://code.visualstudio.com/docs/agent-customization/custom-agents

---

## 7. Agent Skills — **YES, fully supported**

This is the headline answer: **VS Code supports Anthropic-style Agent Skills natively, including `.claude/skills/` and `disable-model-invocation`.** VS Code describes Agent Skills as an open standard (**agentskills.io**) *"that enables portability across different AI agents"*, working across *"GitHub Copilot in VS Code, GitHub Copilot CLI, and GitHub Copilot cloud agent."*

**Version history:** introduced in **v1.108 (Dec 2025)** as experimental (opt-in via `chat.useAgentSkills`) —
> "Agent Skills are folders of instructions, scripts, and resources that GitHub Copilot can load when relevant to perform specialized tasks." — https://code.visualstudio.com/updates/v1_108

`.claude/skills` was supported from that first release ("or `.claude/skills/` for backwards compatibility"). **Generally available and on by default in v1.109 (Jan 2026)**, which also added `chat.agentSkillsLocations` with the four default locations and exposed skills as slash commands. https://code.visualstudio.com/updates/v1_109

### Directories searched

Default value of `chat.agentSkillsLocations`:

```jsonc
{
  ".github/skills":   true,
  ".claude/skills":   true,
  "~/.copilot/skills": true,
  "~/.claude/skills":  true
}
```

Project-scope locations documented: **`.github/skills/`, `.claude/skills/`, `.agents/skills/`**.
Personal-scope: **`~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`**.

Master switch: `chat.useAgentSkills`, default `true` — *"Enable support for agent skills in VS Code."*

> ✅ **You can commit a `.claude/skills/` tree and both Claude Code and VS Code Copilot will pick it up.** That is the single highest-leverage fact in this document.

### Folder layout

```
.github/skills/
└── my-skill/            # directory name must match the `name` field
    ├── SKILL.md         # required
    ├── reference.md     # optional, loaded on demand
    └── scripts/
        └── run.sh
```

### `SKILL.md` frontmatter

| Field | Required | Description |
|---|---|---|
| `name` | **Yes** | Unique identifier. "Only lowercase letters, numbers, and hyphens are allowed", max **64** chars. Must match the folder name. |
| `description` | **Yes** | "A description of what the skill does **and when to use it**", max **1024** chars |
| `argument-hint` | No | Hint text for slash-command invocation |
| `user-invocable` | No | Whether it appears in the `/` menu (default `true`) |
| `disable-model-invocation` | No | Prevents automatic loading; requires manual invocation (default `false`) |
| `context` | No | **(Experimental)** Set to `fork` to run the skill in a dedicated subagent context |

**Verbatim example:**

```markdown
---
name: webapp-testing
description: Guide for testing web applications using Playwright. Use this when asked to create or run browser-based tests.
---

# Web Application Testing with Playwright

This skill helps you create and run browser-based tests for web applications using Playwright.
```

### Progressive disclosure

Three stages, exactly as in the Anthropic model:

1. Copilot discovers skills via their **frontmatter** (`name` + `description` only) — always in context, cheap.
2. It loads the **`SKILL.md` body** when the skill is judged relevant.
3. It reads **referenced files / scripts** only when needed.

### `disable-model-invocation`

**Directly supported**, same field name and semantics as Claude Code: `disable-model-invocation: true` stops the model auto-loading the skill; the user must invoke it explicitly. Pair with `user-invocable: true` to make it a pure slash command.

### Invocation

> "Type `/` in the chat input field to see a list of available skills."

e.g. `/webapp-testing` or `/webapp-testing for the login page`.

### Forked context (experimental)

`context: fork` runs the skill in a dedicated subagent context. Requires `"github.copilot.chat.skillTool.enabled": true`.

**Status:** Agent Skills themselves are **stable/GA** (`chat.useAgentSkills` defaults to `true`). Only `context: fork` is experimental.

**Source:** https://code.visualstudio.com/docs/agent-customization/agent-skills

---

## 8. MCP server configuration

**Locations VS Code reads:**

| Scope | File | Notes |
|---|---|---|
| Workspace | `.vscode/mcp.json` | Commit this. The canonical VS Code location. |
| User profile | user `mcp.json` | Command **MCP: Open User Configuration**; per-profile |
| Remote | remote user config | Command **MCP: Open Remote User Configuration** |
| Agent Host only | `.mcp.json` (workspace root) | Claude Code / portable format |
| Agent Host only | `~/.copilot/mcp-config.json` | *"which the Agent Host reads natively"* |

**Schema** — top-level `servers` key (plus optional `inputs`):

```jsonc
// .vscode/mcp.json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```

- `type`: `"stdio"` | `"http"` | `"sse"`
- stdio servers use `command`, `args`, `env`, `cwd`
- `inputs` declares prompted variables referenced as `${input:...}` — use this for secrets so they never land in the committed file
- VS Code provides IntelliSense/JSON schema validation for the file

### How it differs from Claude Code

| | VS Code | Claude Code |
|---|---|---|
| Workspace file | `.vscode/mcp.json` | `.mcp.json` at repo root |
| Top-level key | `servers` | `mcpServers` |
| Secret handling | `inputs` array + `${input:...}` prompts | env vars / `${VAR}` expansion |
| Transport field | `type: stdio\|http\|sse` | `type` (stdio default) |

VS Code's **Agent Host** harness bridges the gap: it reads `.mcp.json` and `~/.copilot/mcp-config.json` natively. But the **Local** harness reads `.vscode/mcp.json`. **For a team repo targeting both tools, commit both files.**

**Settings:**

| Setting | Default | Status |
|---|---|---|
| `chat.mcp.access` | `true` | Organizationally manageable — controls which MCP servers can be used |
| `chat.mcp.discovery.enabled` | `false` | Auto-discover MCP config from other applications |
| `chat.mcp.autoStart` | — | **Experimental** — restart server when config changes |
| `chat.mcp.serverSampling` | `{}` | Which models are exposed to MCP servers for sampling |
| `chat.mcp.apps.enabled` | `true` | **Experimental** — MCP Apps with rich UIs |

**Source:** https://code.visualstudio.com/docs/agent-customization/mcp-servers

---

## 9. Settings a team repo would actually commit (`.vscode/settings.json`)

```jsonc
{
  // ---- Discovery of customization files ----
  "chat.useAgentsMdFile": true,                    // default true
  "chat.useNestedAgentsMdFiles": true,             // EXPERIMENTAL; default false — turn on for monorepos
  "chat.useCustomizationsInParentRepositories": true, // default false — monorepo / submodule setups
  "chat.useClaudeMdFile": true,                    // default true
  "chat.useAgentSkills": true,                     // default true

  "chat.instructionsFilesLocations": {
    ".github/instructions": true,
    "docs/ai/instructions": true
  },
  "chat.promptFilesLocations": { ".github/prompts": true },
  "chat.agentFilesLocations": { ".github/agents": true },
  "chat.agentSkillsLocations": {
    ".github/skills": true,
    ".claude/skills": true
  },

  // ---- Instruction attachment behaviour ----
  "chat.includeApplyingInstructions": true,        // default true
  "chat.includeReferencedInstructions": true,      // default FALSE — turn on if you split instruction files

  // ---- Agent loop / safety ----
  "chat.agent.maxRequests": 50,                    // default 25
  "chat.tools.terminal.autoApprove": {
    "npm run test": true,
    "git status": true,
    "rm": false,
    "curl": false
  },
  "chat.tools.edits.autoApprove": {
    "**/*.md": true,
    "**/.env*": false
  },

  // ---- MCP ----
  "chat.mcp.discovery.enabled": false
}
```

### Full settings inventory (from the AI settings reference)

**Customization discovery**

| Setting | Default | Status |
|---|---|---|
| `chat.promptFilesLocations` | `{ ".github/prompts": true }` | Stable |
| `chat.promptFilesRecommendations` | `[]` | Stable |
| `chat.instructionsFilesLocations` | `{ ".github/instructions": true, "~/.claude/rules": false }` | Stable |
| `chat.includeApplyingInstructions` | `true` | Stable |
| `chat.includeReferencedInstructions` | `false` | Stable |
| `chat.agentFilesLocations` | `{ ".github/agents": true }` | Stable |
| `chat.agentSkillsLocations` | `{ ".github/skills": true, ".claude/skills": true, "~/.copilot/skills": true, "~/.claude/skills": true }` | Stable |
| `chat.useAgentSkills` | `true` | Stable |
| `chat.useAgentsMdFile` | `true` | Stable |
| `chat.useNestedAgentsMdFiles` | `false` | **Experimental** |
| `chat.useCustomizationsInParentRepositories` | `false` | Stable |
| `chat.useClaudeMdFile` | `true` | Stable |
| `chat.customizations.promptMigration.enabled` | `false` | **Experimental** |

**Agent behaviour**

| Setting | Default | Status |
|---|---|---|
| `chat.agent.enabled` | `true` | Organizational (requires VS Code 1.99+) |
| `chat.agent.maxRequests` | `25` | Stable |
| `chat.agent.sandbox.enabled` | `"off"` | **Preview**, organizational — `off` / `on` / `allowNetwork` |
| `chat.agent.networkFilter` | `false` | Organizational |
| `chat.agent.allowedNetworkDomains` | `[]` | Organizational |
| `chat.agent.deniedNetworkDomains` | `[]` | Organizational |

**Tools**

| Setting | Default | Status |
|---|---|---|
| `chat.tools.terminal.autoApprove` | denylist incl. `rm`, `rmdir`, `del`, `kill`, `curl`, `wget`, `eval`, `chmod`, `chown`, `/^Remove-Item\b/i` — all `false` | Stable |
| `chat.tools.terminal.enableAutoApprove` | `true` | Organizational |
| `chat.tools.edits.autoApprove` | `{}` | Stable — glob → bool |
| `chat.tools.global.autoApprove` | `false` | Organizational — **"disables critical security protections"** |
| `chat.tools.urls.autoApprove` | `[]` | Stable |
| `chat.tools.memory.enabled` | `true` | **Experimental** |
| `chat.tools.compressOutput.enabled` | `false` | **Preview** |
| `chat.tools.riskAssessment.enabled` | `true` | **Experimental** |
| `chat.tools.terminal.outputLocation` | `"chat"` | **Experimental** |
| `chat.tools.terminal.enforceTimeoutFromModel` | `true` | **Experimental** |

**Plugins**

`chat.plugins.enabled` (organizational), `chat.plugins.marketplaces`, `chat.plugins.enabledPlugins`, `chat.plugins.strictMarketplaces`, `chat.pluginLocations` — all **Preview**.

**Other:** `chat.checkpoints.enabled`, `chat.checkpoints.showFileChanges`, `chat.editing.confirmEditRequestRemoval`, `chat.editing.confirmEditRequestRetry`, `chat.editing.autoAcceptDelay`, `chat.editing.revealNextChangeOnResolve`.

**Source:** https://code.visualstudio.com/docs/copilot/reference/copilot-settings

---

## 10. Other committed-to-the-repo things that shape agent behaviour

### 10a. Agent hooks — **Preview**

> "Agent hooks are currently in Preview. The configuration format and behavior might change in future releases."

Introduced in **v1.109 (Jan 2026)** behind `chat.hooks.enabled`. Release notes:
> "VS Code uses the same hook format as Claude Code and Copilot CLI" — https://code.visualstudio.com/updates/v1_109

Agent-scoped hooks (a `hooks` key in `.agent.md` frontmatter, setting `chat.useCustomAgentHooks`) arrived in **v1.111**:
> "Custom agent frontmatter now supports agent-scoped hooks that are only run when you select the specific agent" — https://code.visualstudio.com/updates/v1_111

**Locations:**

| Scope | Path |
|---|---|
| Workspace | `.github/hooks/*.json` |
| Workspace (Claude format) | `.claude/settings.json`, `.claude/settings.local.json` |
| User | `~/.copilot/hooks`, `~/.claude/settings.json` |
| Per-agent | `hooks` field in `.agent.md` frontmatter |

**Events (8):** `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreCompact`, `SubagentStart`, `SubagentStop`, `Stop`.

```jsonc
// .github/hooks/format.json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "npx prettier --write .",
        "timeout": 30
      }
    ]
  }
}
```

Required: `type: "command"` and `command`. Optional: `cwd`, `env`, `timeout`, `windows`, `linux`, `osx`.

**Source:** https://code.visualstudio.com/docs/agent-customization/hooks

### 10b. Agent plugins — **Preview**

Introduced in **v1.110 (Feb 2026)**, still Preview at v1.132.
> "VS Code now supports agent plugins, which are prepackaged bundles of chat customizations." — https://code.visualstudio.com/updates/v1_110

> "Agent plugins are prepackaged bundles of agent customizations that you can discover and install from plugin marketplaces in Visual Studio Code."

Browse via `@agentPlugins` in the Extensions view; **Chat: Install Plugin From Source** installs from a Git URL.

```
my-testing-plugin/
  plugin.json
  skills/test-runner/SKILL.md
  agents/test-reviewer.agent.md
  hooks/hooks.json
  scripts/validate-tests.sh
  .mcp.json
```

`plugin.json` requires `name` — *"Kebab-case plugin name. Only lowercase letters, numbers, and hyphens are allowed."* A plugin can bundle slash commands, skills, agents, hooks, and MCP servers. Local plugin paths via `chat.pluginLocations`.

**Source:** https://code.visualstudio.com/docs/agent-customization/agent-plugins

### 10c. `CLAUDE.md`

Read by VS Code as always-on instructions (`chat.useClaudeMdFile`, default `true`) from the workspace root, the `.claude` folder, and the home directory. Same tier as `AGENTS.md`.

### 10d. Agent harnesses — affects which files apply

VS Code now runs agents on five harnesses, selectable from a dropdown in the chat input:

**Local** (VS Code extension host) · **Copilot** (Agent Host) · **Claude** (local) · **Codex** (local) · **Cloud** (remote).

The **Agent Host Protocol (AHP)** was first named in **v1.126**:
> "As part of rearchitecting how agent sessions work in VS Code, we are adopting the Agent Host Protocol (AHP)." — https://code.visualstudio.com/updates/v1_126

Rolled out incrementally through v1.128–v1.131 behind `chat.agentHost.enabled`:
> "We're rearchitecting how agent sessions work in VS Code around the agent host - a dedicated process that runs agent harnesses such as Copilot, Claude, and Codex" — https://code.visualstudio.com/updates/v1_129

In **v1.132 (Aug 2026)** the `ChatAgentHostEnabled` **policy was removed**:
> "The `ChatAgentHostEnabled` policy is removed, so administrators can no longer centrally disable the agent host through policy. Developers can continue to use chat.agentHost.enabled to choose whether agents run in the separate agent host process." — https://code.visualstudio.com/updates/v1_132

The v1.129 release notes state the prompt-file limitation directly:
> "Prompt files (`*.prompt.md`) are used to describe custom slash commands. They are only supported in the Local agent harness while other harnesses express slash commands with skills." — https://code.visualstudio.com/updates/v1_129

Under Agent Host, user-level customizations come from `~/.copilot/agents`, `~/.copilot/skills`, `~/.copilot/hooks` (and `~/.claude/*` equivalents) rather than the VS Code profile directory. `~/.copilot/skills` first appears in release notes at **v1.109**.

This matters for the file contract:

- **Prompt files (`.prompt.md`) only work on the Local harness.** Skills work everywhere.
- Under Agent Host, user-level customizations come from `~/.copilot` and `~/.claude` rather than the VS Code profile directory.
- Under Agent Host, MCP comes from `.mcp.json` / `~/.copilot/mcp-config.json`.

Third-party cloud agents (Claude and Codex in the cloud) are **Preview**.

**Sources:** https://code.visualstudio.com/docs/agents/agent-types/local-agents (dated 7/31/2026), https://code.visualstudio.com/docs/agent-customization/overview

### 10e. Not repo-committed but relevant

- **Agent Customizations editor** — UI for managing all of the above. *"currently in preview."*
- **Chat Customizations Evaluations extension** — preview.
- **Organization-level instructions** — configured on GitHub.com, not in the repo. GitHub notes they are *"currently only supported for Copilot Chat on GitHub.com, Copilot code review on GitHub.com and Copilot cloud agent on GitHub.com."*

---

## 11. Uncertain / unverified

1. **Precedence conflict.** VS Code says *"VS Code combines and adds them to the chat context, no specific order is guaranteed"*, while GitHub.com documents an explicit within-repository ordering (path-specific → repo-wide → agent files). These are different products/surfaces and may genuinely differ. **I could not find a single authoritative statement that resolves which file wins inside VS Code.** Treat "no guaranteed order" as the operative rule for VS Code.

2. **Nested `AGENTS.md` on GitHub.com.** GitHub's response-customization page makes no mention of nested `AGENTS.md` support. Only VS Code documents it (and only behind an experimental flag). Unconfirmed for github.com surfaces.

3. **Prompt file frontmatter `mode:` vs `agent:`.** Current docs show `agent:` with values `ask` / `agent` / `plan` / custom-agent-name. Earlier docs used `mode:` with `ask` / `edit` / `agent`. I did not find an explicit statement that `mode:` is removed or still accepted as an alias. **Verify against your installed VS Code version.**

4. **Prompt file variables.** Only `${selection}`, `${input:name}`, `${input:name:placeholder}` are enumerated on the current page. `${workspaceFolder}`, `${file}`, and `$ARGUMENTS` are **not** listed. They may still work (they existed in earlier releases / are used elsewhere in VS Code), but this is unconfirmed.

5. **`chat.promptFiles` boolean setting.** Present in 2025-era docs (v1.97–v1.104) as the enable switch. It does not appear in the current AI settings reference. Most likely removed once prompt files went on by default — but I could not find an explicit removal/deprecation note.

6. **`github.copilot.chat.codeGeneration.instructions` current behaviour.** The custom-instructions page says settings-based code-generation and test-generation instructions are *"deprecated as of VS Code 1.102"*. The AI settings reference does not list `github.copilot.chat.codeGeneration.instructions` at all (only `commitMessageGeneration`, `pullRequestDescriptionGeneration`, `reviewSelection`), and lists **no** deprecation flag on those three. **Conflicting/incomplete — assume deprecated and use files instead.**

7. **`github.copilot.chat.codeGeneration.useInstructionFiles`.** Historically the switch for honouring `.github/copilot-instructions.md`. Not found in the current settings reference. Presumably superseded; unconfirmed.

8. **`.chatmode.md` fallback — docs and release notes disagree.** The v1.106 release notes say *"they continue to work and are automatically treated as custom agents"*, with an editor quick fix to migrate. The current docs page says to *rename* them to `.agent.md` *"to continue using them"*, which reads as if they no longer load. No release notes' "Deprecated features" section through v1.132 mentions `.chatmode.md`. **Unresolved — migrate to `.agent.md` and don't depend on the fallback.**

8b. **`.agent.md` vs `.agents.md`.** The v1.106 release-notes page literally writes the suffix as **`.agents.md`** ("These files can use the `.agents.md` suffix…"), while every current docs page uses **`.agent.md`**. This appears to be an error in the original release notes. **Use `.agent.md`.**

9. **`.agents/skills/` in the default setting value.** The Agent Skills prose lists `.agents/skills/` as a project skill location, but the documented **default value** of `chat.agentSkillsLocations` shows only `.github/skills`, `.claude/skills`, `~/.copilot/skills`, `~/.claude/skills`. If you rely on `.agents/skills/`, add it to the setting explicitly.

10. ~~Version numbers.~~ **Resolved.** Current release is **v1.132 (Aug 2026)**; version pages run v1_104 … v1_132. Feature versions confirmed against release notes and are cited inline above.

11. **`.mcp.json` under the Local harness.** Docs state Agent Host reads `.mcp.json` natively. Whether the Local harness also picks it up is **not** stated. Assume it does not.

12. **Exact release that shipped `chat.agentHost.enabled`.** AHP is named in v1.126; v1.127 discusses agent host sessions without naming the setting; the setting is clearly documented by v1.128. It was rolled out incrementally across v1.126–v1.131 with no single "introducing the Agent Host" entry.

13. **GitHub-side (docs.github.com / github.blog) version history.** All version attributions above come from code.visualstudio.com release notes only. The GitHub-side framing (Copilot CLI, cloud agent parity, when GitHub started reading `AGENTS.md`) was not researched in depth.

14. **`chat.hooks.enabled`** appears in the v1.109 release notes but not in the AI settings reference page I fetched. Unconfirmed whether it still exists at v1.132 or hooks are now on by default.

---

## 12. Recommended minimal committed layout for a team repo (Aug 2026)

```
AGENTS.md                                  # the one always-on brief
.github/
  copilot-instructions.md                  # optional: only if you need github.com coverage too
  instructions/
    typescript.instructions.md             # applyTo: '**/*.ts,**/*.tsx'
    tests.instructions.md                  # applyTo: '**/*.test.ts'
  agents/
    planner.agent.md
    reviewer.agent.md
  skills/                                  # OR .claude/skills/ for Claude Code parity
    release-checklist/SKILL.md
    db-migration/
      SKILL.md
      reference.md
      scripts/verify.sh
  hooks/
    format.json                            # Preview
  prompts/
    prep-pr.prompt.md                      # Local harness only
.vscode/
  mcp.json
  settings.json
.mcp.json                                  # for Agent Host + Claude Code parity
```

**The key portability decision:** put reusable workflows in **Agent Skills**, not prompt files. Skills work across every VS Code harness, Copilot CLI, the Copilot cloud agent, and Claude Code (via `.claude/skills/`). Prompt files only work in one place.

---

## Source URLs

- https://code.visualstudio.com/docs/agent-customization/overview
- https://code.visualstudio.com/docs/agent-customization/custom-instructions
- https://code.visualstudio.com/docs/agent-customization/agent-skills
- https://code.visualstudio.com/docs/agent-customization/custom-agents
- https://code.visualstudio.com/docs/agent-customization/prompt-files
- https://code.visualstudio.com/docs/agent-customization/mcp-servers
- https://code.visualstudio.com/docs/agent-customization/hooks
- https://code.visualstudio.com/docs/agent-customization/agent-plugins
- https://code.visualstudio.com/docs/agents/overview
- https://code.visualstudio.com/docs/agents/concepts/customization
- https://code.visualstudio.com/docs/agents/agent-types/local-agents
- https://code.visualstudio.com/docs/copilot/reference/copilot-settings
- https://code.visualstudio.com/docs/agents/concepts/agent-host
- https://docs.github.com/en/copilot/concepts/response-customization
- https://agentskills.io (Agent Skills open standard, referenced by VS Code docs)

**Release notes consulted:** https://code.visualstudio.com/updates/ —
[v1_104](https://code.visualstudio.com/updates/v1_104) (AGENTS.md exp) ·
[v1_105](https://code.visualstudio.com/updates/v1_105) (AGENTS.md GA + nested) ·
[v1_106](https://code.visualstudio.com/updates/v1_106) (chat modes → custom agents) ·
[v1_108](https://code.visualstudio.com/updates/v1_108) (Agent Skills exp) ·
[v1_109](https://code.visualstudio.com/updates/v1_109) (Skills GA, hooks Preview) ·
[v1_110](https://code.visualstudio.com/updates/v1_110) (agent plugins Preview; Edit mode deprecated) ·
[v1_111](https://code.visualstudio.com/updates/v1_111) (agent-scoped hooks) ·
[v1_112](https://code.visualstudio.com/updates/v1_112) ·
[v1_126](https://code.visualstudio.com/updates/v1_126) (AHP named; Edit mode removed) ·
[v1_129](https://code.visualstudio.com/updates/v1_129) (harnesses; prompt-file limitation; prompt→skill migration) ·
[v1_132](https://code.visualstudio.com/updates/v1_132) (current)
