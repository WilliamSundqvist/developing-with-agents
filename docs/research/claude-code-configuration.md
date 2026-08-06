# Making a repository agentic for Claude Code — the committed-file contract

**Researched:** 2026-08-06. **Against:** Claude Code v2.1.223-era docs (latest changelog entry seen).
**Primary sources only.** Note: the docs moved host — `https://docs.claude.com/en/docs/claude-code/*` now
301-redirects to **`https://code.claude.com/docs/en/*`**. All URLs below use the canonical new host.

---

## 1. File path → purpose → commit to git?

| Path | Purpose | Commit? |
| :--- | :--- | :--- |
| `./CLAUDE.md` *or* `./.claude/CLAUDE.md` | Team project instructions, loaded in full every session | **Yes** |
| `./CLAUDE.local.md` | Personal per-project instructions | **No** — gitignore it |
| `./AGENTS.md` | Cross-tool agent instructions. Claude Code does **not** read it natively; bridge with `@AGENTS.md` from `CLAUDE.md` | Yes (but it needs the bridge) |
| `.claude/rules/*.md` | Modular instructions; optional `paths:` frontmatter scopes them to file globs | **Yes** |
| `.claude/skills/<name>/SKILL.md` | On-demand workflows/reference; also creates `/<name>` | **Yes** |
| `.claude/skills/<name>/{reference.md,scripts/,examples/}` | Progressive-disclosure supporting files | **Yes** |
| `.claude/commands/*.md` | Legacy flat slash commands. Still supported; skills are the recommended form | Yes (prefer migrating) |
| `.claude/agents/*.md` | Subagent definitions (recursive subfolders allowed) | **Yes** |
| `.claude/settings.json` | Team settings: permissions, hooks, env, plugins, MCP approvals | **Yes** |
| `.claude/settings.local.json` | Personal per-repo overrides + "don't ask again" approvals | **No** — gitignored |
| `.claude/hooks/*.sh` / `*.ps1` | Hook scripts referenced from `settings.json` | **Yes** |
| `.mcp.json` (repo **root**, not `.claude/`) | Project-scoped MCP servers | **Yes** |
| `.claude/output-styles/*.md` | Custom system-prompt personas | Yes, if the team wants them |
| `.claude-plugin/plugin.json` | Plugin manifest (only if the repo *is* a plugin) | Yes |
| `.claude-plugin/marketplace.json` | Marketplace catalog (only if the repo *is* a marketplace) | Yes |
| `~/.claude/**` | User scope — never in the repo | No |

Source for the layout table: [Settings](https://code.claude.com/docs/en/settings),
[Memory](https://code.claude.com/docs/en/memory), [Skills](https://code.claude.com/docs/en/skills),
[Subagents](https://code.claude.com/docs/en/sub-agents), [MCP](https://code.claude.com/docs/en/mcp).

**Minimum viable agentic repo:** `CLAUDE.md` + `.claude/settings.json` (permissions allowlist) is enough.
Add skills, agents, hooks, `.mcp.json` as triggers appear — the docs give an explicit adoption ladder in
[Extend Claude Code § Build your setup over time](https://code.claude.com/docs/en/features-overview#build-your-setup-over-time).

---

## 2. `CLAUDE.md` vs `AGENTS.md`

**Stable. The AGENTS.md answer changed meaningfully — Claude Code still does NOT read it natively.**

> "Claude Code reads `CLAUDE.md`, not `AGENTS.md`."
> — [Memory § AGENTS.md](https://code.claude.com/docs/en/memory#agents-md)

The documented bridge is an import (or a symlink where the OS allows it):

```markdown
<!-- CLAUDE.md -->
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```

```bash
# Alternative, when you need no Claude-specific additions:
ln -s AGENTS.md CLAUDE.md
```

On Windows a symlink needs Administrator or Developer Mode, so **prefer the `@AGENTS.md` import** in
cross-platform repos. If both `CLAUDE.md` and `AGENTS.md` exist and `CLAUDE.md` does *not* import it,
only `CLAUDE.md` is loaded and `AGENTS.md` is silently ignored.
([Memory § AGENTS.md](https://code.claude.com/docs/en/memory#agents-md))

`/init` *does* read other tools' rule files: Cursor (`.cursor/rules/`, `.cursorrules`) and Copilot
(`.github/copilot-instructions.md`) always; with `CLAUDE_CODE_NEW_INIT=1` it also reads `AGENTS.md`,
`.devin/rules/`, `.windsurf/rules/` / `.windsurfrules`, and `.clinerules`.

### Locations and load order (broadest → most specific)

| Scope | Location |
| :--- | :--- |
| Managed policy | macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux/WSL `/etc/claude-code/CLAUDE.md`; Windows `C:\Program Files\ClaudeCode\CLAUDE.md` |
| User | `~/.claude/CLAUDE.md` |
| Project | `./CLAUDE.md` **or** `./.claude/CLAUDE.md` |
| Local | `./CLAUDE.local.md` |

### Nested / monorepo lookup rules

- Claude walks **up** the tree from cwd, collecting `CLAUDE.md` and `CLAUDE.local.md` at each level.
- All discovered files are **concatenated, not overridden**. Root-down ordering, so the file closest to
  cwd is read last. Within a directory, `CLAUDE.local.md` is appended after `CLAUDE.md`.
- Files in **subdirectories below** cwd are *not* loaded at launch — they load on demand the first time
  Claude reads a file in that subdirectory.
- Monorepo escape hatch: `claudeMdExcludes` (glob against absolute paths; arrays merge across settings
  layers; managed-policy CLAUDE.md cannot be excluded). Put it in `settings.local.json`:

```json
{
  "claudeMdExcludes": [
    "**/monorepo/CLAUDE.md",
    "/home/user/monorepo/other-team/.claude/rules/**"
  ]
}
```

Source: [Memory § How CLAUDE.md files load](https://code.claude.com/docs/en/memory#how-claude-md-files-load).

### `@import` syntax

- `@path/to/import`, relative **to the importing file**, or absolute. Recursion allowed to **4 hops**.
- Imports are expanded and loaded **at launch** — splitting into imports organizes but does **not** save context.
- Parsing **skips code spans and fenced blocks**: `` `@README` `` stays literal, bare `@README` imports.
- An import resolving **outside the working directory** (e.g. `@~/.claude/my-notes.md`) triggers a
  one-time approval dialog; declining disables it permanently. User-scope memory files are exempt.
- Block-level HTML comments (`<!-- ... -->`) are stripped before injection — free maintainer notes.

### `CLAUDE.local.md` status

**Alive and supported**, not deprecated. Loads alongside `CLAUDE.md`, appended after it, per directory.
Add it to `.gitignore`. Caveat: it exists only in the worktree where you created it, so for cross-worktree
personal notes import from home instead (`@~/.claude/my-project-instructions.md`).

### `.claude/rules/` (worth committing, often missed)

```markdown
---
paths:
  - "src/api/**/*.ts"
  - "lib/**/*.{ts,tsx}"
---

# API Development Rules
- All API endpoints must include input validation
```

Rules **without** `paths` load at launch with the same priority as `.claude/CLAUDE.md`. Rules **with**
`paths` load only when Claude touches a matching file. Discovered recursively; symlinks supported.
Note for compaction: project-root `CLAUDE.md` is re-injected after `/compact`, but **nested CLAUDE.md
and path-scoped rules are not** — they reload on next match.
([Memory § Organize rules](https://code.claude.com/docs/en/memory#organize-rules-with-claude/rules/))

---

## 3. Agent Skills — `.claude/skills/<name>/SKILL.md`

**Stable, and the biggest recent change in the whole contract:**

> "**Custom commands have been merged into skills.** A file at `.claude/commands/deploy.md` and a skill at
> `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way."
> — [Skills](https://code.claude.com/docs/en/skills)

`https://docs.claude.com/en/docs/claude-code/slash-commands` now redirects into the Skills page.
Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard, with Claude-Code-only extensions.

### Full frontmatter field list

All fields optional; only `description` is recommended. Booleans accept `yes/no/on/off/1/0` as well as
`true/false` (v2.1.218+).

| Field | Notes |
| :--- | :--- |
| `name` | Display label only for personal/project skills (command name comes from the **directory**). For *plugin* skills it sets the last command segment. |
| `description` | What it does + when to use. Combined `description` + `when_to_use` truncated at **1,536 chars** in the listing. |
| `when_to_use` | Extra trigger phrases; appended to `description`, counts toward the cap. |
| `argument-hint` | Autocomplete hint, e.g. `[issue-number]`. |
| `arguments` | Named positional args for `$name` substitution. Space-separated string or YAML list. |
| `disable-model-invocation` | `true` → only you can invoke; removes description from context entirely. |
| `user-invocable` | `false` → hidden from `/` menu; only Claude invokes. |
| `allowed-tools` | Pre-approved tools **for the invoking turn only**; clears on your next message. |
| `disallowed-tools` | Tools removed from the pool while active. |
| `model` | Same values as `/model`, or `inherit`. Applies for the rest of the turn only. |
| `effort` | `low`\|`medium`\|`high`\|`xhigh`\|`max`. |
| `context` | `fork` → run in a forked subagent. |
| `agent` | Which subagent type when `context: fork` (default `general-purpose`). |
| `background` | With `context: fork`, `false` waits for the result in-turn. Default `true`. v2.1.218+. |
| `hooks` | Hooks scoped to this skill's lifecycle. |
| `paths` | Globs limiting when Claude auto-loads the skill. |
| `shell` | `bash` (default) or `powershell` for `` !`cmd` `` blocks. |
| `metadata` | Free-form map for your own tooling. |
| `license` | Accepted, not acted on (Agent Skills spec field). |
| `compatibility` | Accepted, not acted on. Max 500 chars. |

**Portability warning:** outside Claude Code (claude.ai uploads, Skills API, `package_skill.py`) only
**six** fields validate — `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
Anything else is a **hard error**, e.g. `Unexpected key(s) in SKILL.md frontmatter: argument-hint`.
([Skills § Using skill frontmatter outside Claude Code](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code))

### Precedence and discovery

- Name collisions: **enterprise > personal (`~/.claude/skills/`) > project (`.claude/skills/`)**, and any
  of these overrides a bundled skill of the same name. Plugin skills are namespaced `plugin:skill`.
- If a skill and a `.claude/commands/` file share a name, **the skill wins**.
- Project skills load from `.claude/skills/` in cwd **and every parent up to the repo root**.
- **Nested** `.claude/skills/` below cwd load lazily, the first time Claude reads/edits a file there.
  On name clash the nested one is exposed as `apps/web:deploy`; typing `/deploy` runs the root one and
  appends a list of directory-qualified variants (v2.1.203+).
- Live change detection: edits to `SKILL.md` are picked up mid-session, no restart — unless the top-level
  skills directory didn't exist at session start.
- `--add-dir` is an exception to the "additional directories grant file access, not config" rule:
  `.claude/skills/` inside an added dir **is** loaded. `permissions.additionalDirectories` is not.

### Progressive disclosure + supporting files

```text
my-skill/
├── SKILL.md          # required — overview and navigation
├── reference.md      # detailed API docs — loaded when needed
├── examples.md
└── scripts/
    └── helper.py     # executed, not loaded
```

Reference them explicitly so Claude knows when to open them:

```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

Docs guidance: **keep `SKILL.md` under 500 lines**; once loaded, content stays in context all session, so
every line is a recurring token cost.

### Invocation: slash command vs auto

| Frontmatter | You can invoke | Claude can invoke | When loaded |
| :--- | :--- | :--- | :--- |
| (default) | Yes | Yes | Description always in context; full skill on invoke |
| `disable-model-invocation: true` | Yes | No | Description **not** in context; full skill when you invoke |
| `user-invocable: false` | No | Yes | Description always in context; full skill on invoke |

Command name comes from the **directory name** (`.claude/skills/deploy-staging/SKILL.md` → `/deploy-staging`).

### Substitutions and dynamic context

`$ARGUMENTS`, `$ARGUMENTS[N]`, `$N` (0-based: `$0` is first), `$name` (from `arguments:`),
`${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`, `${CLAUDE_PROJECT_DIR}`.
Escape a literal with a backslash: `\$1.00`. If a skill has no `$ARGUMENTS`, args are appended as
`ARGUMENTS: <value>`.

`` !`command` `` runs **before** Claude sees the content and is replaced by stdout (preprocessing, not a
tool call). Only recognized at line start or after whitespace. Multi-line form uses a ` ```! ` fence.

The canonical self-contained-script pattern, where `${CLAUDE_SKILL_DIR}` is substituted in **both** the
body and the `allowed-tools` rule so the script runs without a prompt (v2.1.129+):

```yaml
---
name: render-chart
description: Render a chart from a CSV file
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
---

Run `${CLAUDE_SKILL_DIR}/scripts/render.sh <csv-file>` to render the chart.
```

Security-relevant for committed skills: `allowed-tools` in a project skill takes effect only **after you
accept the workspace trust dialog** — review project skills before trusting a clone, since a skill can
grant itself broad tool access. Managed/enterprise lockdown: `"disableSkillShellExecution": true`
disables `` !`cmd` `` for user/project/plugin skills.

### Full working example

```yaml
---
description: Summarizes uncommitted changes and flags anything risky. Use when the user asks what changed, wants a commit message, or asks to review their diff.
---

## Current changes

!`git diff HEAD`

## Instructions

Summarize the changes above in two or three bullet points, then list any risks.
```

---

## 4. Slash commands — `.claude/commands/*.md`

**Status: supported, but superseded.** The docs' own note:

> "Files in `.claude/commands/` still work and support the same [frontmatter](https://code.claude.com/docs/en/skills#frontmatter-reference).
> Skills are recommended since they support additional features like supporting files."

- Command name = **file name without extension** (`.claude/commands/deploy.md` → `/deploy`).
- Same `$ARGUMENTS` / `$ARGUMENTS[N]` / `$N` / `$name` substitution and the same `` !`cmd` `` dynamic
  context injection as skills.
- On a name tie with a skill, **the skill wins**.

### When to use which

| Use a `.claude/commands/*.md` file | Use a `.claude/skills/<name>/SKILL.md` |
| :--- | :--- |
| Trivial one-file prompt you already have | Anything needing supporting files, scripts, or reference docs |
| Legacy files you don't want to churn | You want Claude to auto-invoke it by description |
| — | You need `context: fork`, `paths:`, `hooks:`, `model:`, `effort:` |
| — | New work of any kind — this is the recommended form |

The functional distinction is no longer "command = you type it, skill = model picks it". Both do both;
you control it with `disable-model-invocation` / `user-invocable`. **Recommendation for a new repo: use
skills exclusively.**

Practical repo split (from [features-overview § Hook vs Skill](https://code.claude.com/docs/en/features-overview)):
put *guardrails* in hooks (guaranteed), *judgement* in skills (interpreted), *always-on facts* in CLAUDE.md.

---

## 5. Subagents — `.claude/agents/*.md`

**Stable.** Recent change: as of **v2.1.198 the `/agents` creation wizard is gone** — it now just tells you
to ask Claude or edit `.claude/agents/` directly. File format and locations are unchanged.
([Subagents](https://code.claude.com/docs/en/sub-agents))

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

### Frontmatter — only `name` and `description` are required

| Field | Notes |
| :--- | :--- |
| `name` **(req)** | lowercase-hyphen, unique across the whole tree. **Cannot contain `:`** (reserved for plugin scoping) — v2.1.218+ refuses to load such files. Filename need not match. Hooks see it as `agent_type`. |
| `description` **(req)** | When Claude should delegate. Add "use proactively" to encourage delegation. |
| `tools` | Comma list. Omitted = inherit everything available to subagents. |
| `disallowedTools` | Subtracted from the inherited/specified list. |
| `model` | `sonnet`\|`opus`\|`haiku`\|`fable`, a full ID (`claude-opus-5`), or `inherit`. **Defaults to `inherit`.** |
| `permissionMode` | `default`\|`acceptEdits`\|`auto`\|`dontAsk`\|`bypassPermissions`\|`plan`\|`manual`. |
| `maxTurns` | Agentic turn cap. |
| `skills` | Skills **fully preloaded** into the subagent at startup (content, not just description). |
| `mcpServers` | Named references or inline definitions. |
| `hooks` | Lifecycle hooks scoped to this subagent (`Stop` becomes `SubagentStop`). |
| `memory` | `user`\|`project`\|`local` — enables cross-session auto memory. |
| `background` | `true` = always background. Unset = Claude chooses; **background is the default since v2.1.198**. |
| `effort` | `low`…`max`. |
| `isolation` | `worktree` → temporary git worktree, branched from the default branch, auto-cleaned if unchanged. |
| `color` | `red`\|`blue`\|`green`\|`yellow`\|`purple`\|`orange`\|`pink`\|`cyan`. |
| `initialPrompt` | Auto-submitted first turn when run as the main session agent (`--agent`). |

**Plugin subagents silently ignore `hooks`, `mcpServers`, and `permissionMode`** for security reasons.

### Precedence and dispatch

Priority: **managed settings > `--agents` CLI flag > `.claude/agents/` > `~/.claude/agents/` > plugin `agents/`.**
Project dirs are walked up from cwd; the definition closest to cwd wins across nested dirs (v2.1.178+).
Directories are scanned **recursively**, but subfolders don't affect identity — identity comes only from `name`.

Dispatch, escalating in force:
1. **Automatic** — Claude matches your request against `description`.
2. **Natural language** — "Use the test-runner subagent to fix failing tests".
3. **@-mention** — `@"code-reviewer (agent)"` or typed `@agent-code-reviewer`; guarantees that subagent runs.
4. **Session-wide** — `--agent` flag or the `agent` setting.

Nesting depth default is **3 layers** below main (v2.1.219); tune with `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`.

Body = system prompt. Subagents get **only** that plus basic env details, not Claude Code's full system
prompt. `Explore` and `Plan` built-ins skip CLAUDE.md and git status.

---

## 6. Hooks — `.claude/settings.json`

**Stable and by far the largest surface.** Full reference: [Hooks](https://code.claude.com/docs/en/hooks).

### Hook events

`SessionStart`, `Setup`, `UserPromptSubmit`, `UserPromptExpansion`, `PreToolUse`, `PermissionRequest`,
`PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Notification`, `MessageDisplay`,
`SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `Stop`, `StopFailure`, `TeammateIdle`,
`InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `DirectoryAdded`, `FileChanged`, `WorktreeCreate`,
`WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`, `SessionEnd`.

### Schema

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-rm.sh",
            "args": [],
            "timeout": 600,
            "statusMessage": "Checking command safety"
          }
        ]
      }
    ]
  },
  "disableAllHooks": false
}
```

- **Handler types:** `command`, `http`, `mcp_tool`, `prompt`, `agent` (agent is experimental).
- **Matcher semantics:** `"*"`/`""`/omitted = all. Only letters/digits/`_`/`-`/space/`,`/`|` → exact or
  list (`Edit|Write`). Anything else → **unanchored JavaScript RegExp** (`^Notebook`, `mcp__memory__.*`).
- **Matcher meaning varies by event:** tool name for `PreToolUse`; start reason (`startup`/`resume`/
  `clear`/`compact`/`fork`) for `SessionStart`; agent type for `SubagentStart`/`SubagentStop`;
  `manual`/`auto` for compaction; load reason for `InstructionsLoaded`. `UserPromptSubmit`, `Stop`,
  `PostToolBatch` and several others take **no matcher**.
- **Timeouts:** 600s for command/http/mcp_tool; 30s for `prompt`; 60s for `agent`; `UserPromptSubmit` 30s;
  `MessageDisplay` 10s; `SessionEnd` shares a **1.5s** budget.
- **Exec form vs shell form:** presence of `args` spawns the executable directly (no shell tokenization);
  absence passes the string to `sh -c` (Unix) or PowerShell (Windows).
- **Path placeholders**, also exported as env vars: `${CLAUDE_PROJECT_DIR}`, `${CLAUDE_PLUGIN_ROOT}`,
  `${CLAUDE_PLUGIN_DATA}`.

### What a hook can do to steer or block

| Exit code | Effect |
| :--- | :--- |
| `0` | Success; stdout parsed for JSON |
| `2` | **Blocking error**; stderr shown to Claude |
| other | Non-blocking; execution continues |

Exit `2` **blocks** on: `PreToolUse`, `PermissionRequest`, `UserPromptSubmit`, `UserPromptExpansion`,
`Stop`, `SubagentStop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `ConfigChange`, `PreCompact`,
`WorktreeCreate`. On `PostToolUse*` it surfaces stderr to Claude without undoing the call.

JSON output on stdout is richer than exit codes:

```json
{
  "continue": true,
  "stopReason": "...",
  "suppressOutput": false,
  "systemMessage": "warning shown to the user",
  "additionalContext": "context injected for Claude (capped at 10k chars)",
  "decision": "block",
  "reason": "...",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask|defer",
    "permissionDecisionReason": "...",
    "updatedInput": {},
    "updatedToolOutput": "...",
    "displayContent": "..."
  }
}
```

Concretely, a committed hook can:
- **Inject context every session** — `SessionStart` → `hookSpecificOutput.additionalContext`
  (also `initialUserMessage`, `sessionTitle`, `watchPaths`, `reloadSkills`).
- **Inject context per prompt** — `UserPromptSubmit` → `additionalContext`, or block the prompt outright.
- **Hard-block a tool call** — `PreToolUse` → `permissionDecision: "deny"`.
- **Rewrite a tool call before it runs** — `PreToolUse` → `updatedInput`.
- **Rewrite tool output** — `PostToolUse` → `updatedToolOutput`.
- **Force a workflow / refuse to let the turn end** — `Stop` → `{"decision":"block","reason":"..."}` plus
  `additionalContext: "Continue with: ..."`.
- **Kill the session** — `continue: false` + `stopReason`.

Important guardrail: **hook decisions do not bypass permission rules.** A matching `deny` rule blocks the
call and a matching `ask` rule still prompts, even when a `PreToolUse` hook returned `"allow"`.
([Permissions](https://code.claude.com/docs/en/permissions))

Blocking-rm example, committed as `.claude/hooks/block-rm.sh`:

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')
if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"Destructive command blocked by hook"}}'
else
  exit 0
fi
```

Hooks can also be **scoped to a skill or subagent** via their frontmatter `hooks:` field, using the same
shape — useful for a checked-in skill that must validate its own tool calls:

```yaml
---
name: secure-operations
description: Perform operations with security checks
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

Hooks **merge** across all sources (user, project, local, managed, plugin, skill/agent frontmatter) — they
do not override by name.

---

## 7. Settings — project vs local vs user

**Stable.** [Settings](https://code.claude.com/docs/en/settings)

| Scope | Location | Shared? |
| :--- | :--- | :--- |
| Managed | `managed-settings.json` (macOS `/Library/Application Support/ClaudeCode/`, Linux/WSL `/etc/claude-code/`, Windows `C:\Program Files\ClaudeCode\`), MDM/registry, or server-managed | Deployed by IT |
| User | `~/.claude/settings.json` | No |
| **Project** | `.claude/settings.json` | **Yes — commit** |
| Local | `.claude/settings.local.json` | No — gitignore |

**Precedence, highest first:** managed → command-line args → local → project → user.
*Permission rules merge across scopes rather than override* — and deny always wins over allow.

### What belongs in the committed `.claude/settings.json`

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(npm run lint)", "Bash(npm run test *)"],
    "deny": ["Bash(curl *)", "Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"]
  },
  "env": { "CLAUDE_CODE_ENABLE_TELEMETRY": "1" },
  "hooks": { "PostToolUse": [ { "matcher": "Edit|Write", "hooks": [ { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/lint.sh" } ] } ] },
  "enableAllProjectMcpServers": false,
  "enabledMcpjsonServers": ["shared-server"],
  "extraKnownMarketplaces": { "company-tools": { "source": { "source": "github", "repo": "your-org/claude-plugins" } } },
  "enabledPlugins": { "code-formatter@company-tools": true }
}
```

- **Yes, commit:** `permissions.allow`/`deny`/`ask`/`defaultMode`, `env`, `hooks`, `enabledPlugins`,
  `extraKnownMarketplaces`, `enabledMcpjsonServers`/`disabledMcpjsonServers`, `statusLine`, `outputStyle`,
  `disableSkillShellExecution`, `autoMemoryEnabled`, `disableBundledSkills`, `skillOverrides`.
- **Never commit (belongs in `settings.local.json`):** machine-specific paths, "yes don't ask again"
  approvals, `claudeMdExcludes` for other teams' files, personal `skillOverrides`, output-style picks
  (`/config` writes `outputStyle` to `settings.local.json` by default).

**Permission rule syntax:** `Bash(npm run test *)` — the space before `*` matters (`Bash(ls *)` matches
`ls -la` but not `lsof`; `Bash(ls*)` matches both). `:*` is an equivalent trailing wildcard. Tool-name
globs work in `deny`/`ask` (`"mcp__*"`), but allow-globs must be anchored after a literal
`mcp__<server>__` prefix — an unanchored allow glob is skipped with a warning.
`permissions.disableBypassPermissionsMode` / `disableAutoMode` set to `"disable"` lock out those modes.

**Trust gate — important for cloned repos:** `permissions.allow` and `permissions.additionalDirectories`
in a project's `.claude/settings.json` are read but **not applied** until you accept the workspace trust
dialog. `deny`/`ask` are unaffected (they only restrict). Same gate applies to skill `allowed-tools` and
to `.mcp.json` approvals committed in project settings (v2.1.196+).

Reload behavior: `permissions` and `hooks` reload immediately (firing `ConfigChange`); `model` and
`outputStyle` are read once at session start.

---

## 8. Plugins & marketplaces, output styles, statusline

### Plugins — `.claude-plugin/`

**Stable.** [Plugins reference](https://code.claude.com/docs/en/plugins-reference).
Only `plugin.json` goes in `.claude-plugin/`; **every component directory sits at the plugin root.**

```text
my-plugin/
├── .claude-plugin/
│   └── plugin.json      ← only the manifest here
├── skills/              ← at root
├── agents/
├── hooks/hooks.json
├── output-styles/
├── .mcp.json
├── .lsp.json
└── bin/                 ← added to the Bash tool's PATH
```

The manifest is **optional** — components auto-discover and the name defaults to the directory name.
If present, `name` is the only required field:

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": { "name": "Author Name", "email": "author@example.com" },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1"],
  "skills": "./custom/skills/",
  "agents": ["./custom/agents/reviewer.md"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "dependencies": ["helper-lib", { "name": "secrets-vault", "version": "~2.1.0" }]
}
```

Unrecognized top-level fields are **ignored**, so one manifest can double as a VS Code/Cursor/npm manifest.
`claude plugin validate ./my-plugin --strict` turns warnings into errors for CI.
Versioning gotcha: if you set `version`, you must bump it for users to get changes; **omit it** and the
git commit SHA is used instead (better for internal team plugins).

### Committing marketplaces for a team

`.claude-plugin/marketplace.json` at the marketplace repo root; plugin `source` paths resolve relative to
the **marketplace root** (the dir containing `.claude-plugin/`), not the JSON file's dir. Then in the
consuming repo's `.claude/settings.json`, team members are prompted to install when they trust the folder:

```json
{
  "extraKnownMarketplaces": {
    "company-tools": { "source": { "source": "github", "repo": "your-org/claude-plugins" } }
  },
  "enabledPlugins": {
    "code-formatter@company-tools": true,
    "deployment-tools@company-tools": true
  }
}
```

Note: `pluginConfigs` entries in project/local settings are **ignored** since v2.1.207 (supply-chain
hardening) — but `enabledPlugins` still honors project and local settings.
([Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces))

Also relevant: a plain skill folder containing `.claude-plugin/plugin.json` loads as a
`<name>@skills-dir` plugin, letting it bundle agents/hooks/MCP.

### Output styles — still current

`.claude/output-styles/*.md` (project), `~/.claude/output-styles` (user). Built-ins: **Default,
Proactive, Explanatory, Learning**.

```markdown
---
name: Diagrams first
description: Lead every explanation with a diagram
keep-coding-instructions: true
---

When explaining code, architecture, or data flow, start with a Mermaid diagram, then explain in prose.
```

Frontmatter: `name`, `description`, `keep-coding-instructions` (default `false` — **without it you lose
Claude Code's built-in software-engineering instructions**), `force-for-plugin` (plugin-only).
**Changed:** the standalone `/output-style` command was deprecated in v2.1.73 and **removed in v2.1.91** —
use `/config` or set `outputStyle` in settings. Selection is written to `.claude/settings.local.json`,
so if you want a team-wide style you must put `outputStyle` in `.claude/settings.json` yourself.
Applies to the main conversation only — subagents use their own system prompt.
([Output styles](https://code.claude.com/docs/en/output-styles))

### Statusline — still current

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 2
  }
}
```

Optional fields: `padding` (default `0`), `refreshInterval` (seconds, min `1`), `hideVimModeIndicator`.
Contract: Claude Code pipes JSON session data on **stdin**; the script prints text to stdout. Committable
if the script is repo-relative, but it's usually a personal/user-level setting.
([Statusline](https://code.claude.com/docs/en/statusline))

---

## 9. MCP — `.mcp.json` at repo root

**Stable.** [MCP § Project scope](https://code.claude.com/docs/en/mcp#project-scope)

> "Project-scoped servers enable team collaboration by storing configurations in a `.mcp.json` file at
> your project's root directory. … Check `.mcp.json` into version control."

```json
{
  "mcpServers": {
    "shared-server": {
      "type": "http",
      "url": "https://example.com/mcp"
    },
    "local-tool": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "some-mcp-server"],
      "env": { "API_KEY": "${API_KEY}" },
      "timeout": 600000
    }
  }
}
```

- `type`: `stdio` | `http` (alias `streamable-http`) | `sse` (**deprecated**) | `ws`.
- **A `url` with no `type` is a hard configuration error** — the server is skipped with
  `MCP server "<name>" has a "url" but no "type"` (clearer message since v2.1.202).
- **Env var expansion:** `${VAR}` and `${VAR:-default}`, in `command`, `args`, `env`, `url`, `headers`.
  Unset with no default → warning, and the literal `${VAR}` is used. This is the mechanism that lets a
  committed `.mcp.json` stay secret-free.
- `CLAUDE_PROJECT_DIR` is set in the **spawned server's** environment, not Claude Code's — so referencing
  it via `${CLAUDE_PROJECT_DIR}` inside `.mcp.json` needs a default: `${CLAUDE_PROJECT_DIR:-.}`.
- **Approval:** project servers prompt for approval before use. Team-wide pre-approval via
  `enableAllProjectMcpServers` / `enabledMcpjsonServers` in `.claude/settings.json` — but these are
  **ignored in an untrusted folder** (v2.1.196+), so a fresh clone still prompts.
  Reset with `claude mcp reset-project-choices`.
- **Scope precedence:** local → project (`.mcp.json`) → user (`~/.claude.json`) → plugin servers →
  claude.ai connectors. The whole entry from the winning source is used; fields are not merged.
- Reserved names that will be skipped: `workspace`, `claude-in-chrome`, `computer-use`,
  `Claude Preview`, `Claude Browser`.

### How it differs from VS Code

| | Claude Code | VS Code |
| :--- | :--- | :--- |
| Path | `.mcp.json` at **repo root** | `.vscode/mcp.json` |
| Top-level key | `"mcpServers"` | `"servers"` |
| Secrets | `${VAR}` / `${VAR:-default}` env expansion | `"inputs"` prompt mechanism (VS Code-specific) |
| Extra keys | `timeout`, `headersHelper`, `alwaysLoad` | `sandbox` / `sandboxEnabled` |

VS Code source: [MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers).
The two files are **not interchangeable** — a repo supporting both needs both files.

---

## 10. What `/init` generates today

The commands reference entry, verbatim:

> `/init` | Initialize project with a `CLAUDE.md` guide. Set `CLAUDE_CODE_NEW_INIT=1` for an interactive
> flow that also walks through skills, hooks, and personal memory files
> — [Commands](https://code.claude.com/docs/en/commands)

**Default behavior:** analyzes the codebase and writes a starting `CLAUDE.md` with build commands, test
instructions, and discovered conventions. If `CLAUDE.md` already exists it **suggests improvements rather
than overwriting**. It reads Cursor rules (`.cursor/rules/`, `.cursorrules`) and Copilot rules
(`.github/copilot-instructions.md`) and folds relevant parts in.

**`CLAUDE_CODE_NEW_INIT=1` (opt-in, newer):** an interactive multi-phase flow. It asks which artifacts to
set up — **CLAUDE.md files, skills, and hooks** — explores the codebase with a subagent, asks follow-up
questions, and presents a reviewable proposal before writing anything. It additionally reads `AGENTS.md`,
`.devin/rules/`, `.windsurf/rules/` / `.windsurfrules`, and `.clinerules`, and choosing the "personal"
option creates `CLAUDE.local.md` and gitignores it for you.
([Memory § Set up a project CLAUDE.md](https://code.claude.com/docs/en/memory#set-up-a-project-claude-md))

**So: `/init` alone does NOT scaffold `.claude/settings.json`, `.claude/agents/`, or `.mcp.json`.** The
new-init flow covers skills and hooks but not agents/MCP/permissions.

---

## 11. Stability summary — what changed recently

| Area | Status Aug 2026 | Recent change |
| :--- | :--- | :--- |
| Docs host | — | `docs.claude.com/en/docs/claude-code/*` → **`code.claude.com/docs/en/*`** |
| `CLAUDE.md` / imports / `CLAUDE.local.md` | Stable | `.claude/rules/` with `paths:` is the newer, better-scoped alternative; HTML comments now stripped |
| `AGENTS.md` | Stable — **still not native** | Documented import/symlink bridge; `/init` reads it only under `CLAUDE_CODE_NEW_INIT=1` |
| Skills | Stable, actively extended | **Commands merged into skills**; `background:` + boolean-alias parsing v2.1.218; skill stacking v2.1.199; re-invoke dedup v2.1.202; nested qualified names v2.1.203 |
| `.claude/commands/` | Supported, superseded | Skills win on name ties |
| Subagents | Stable | `/agents` wizard removed v2.1.198; background-by-default v2.1.198; nesting depth 3 v2.1.219; `:` in `name` rejected v2.1.218 |
| Hooks | Stable, large surface | `DirectoryAdded` v2.1.219; `agent` handler type experimental; PreToolUse-vs-tool-restriction bypass fixed v2.1.222 |
| Settings | Stable | `pluginConfigs` no longer read from project/local settings (v2.1.207); trust-gating of `.mcp.json` approvals (v2.1.196) |
| Plugins/marketplaces | Stable | Manifest now optional; owner wildcards in managed marketplace policy v2.1.223 |
| Output styles | Current | `/output-style` command **removed** v2.1.91 — use `/config` or `outputStyle` |
| Statusline | Current | `refreshInterval`, `hideVimModeIndicator` added |
| `.mcp.json` | Stable | Clearer missing-`type` error v2.1.202; discovery cache v2.1.221 |
| `/init` | Stable, new flow opt-in | `CLAUDE_CODE_NEW_INIT=1` multi-phase interactive flow |

---

## Uncertain / unverified

1. **Exact `.claude/commands/*.md` frontmatter subset.** The docs say commands "support the same
   frontmatter" as skills and link to the skills table, but I found no statement confirming that
   *Claude-Code-extension* fields specific to directory-based skills — notably `context: fork`, `agent:`,
   `background:`, and supporting-file references — behave identically in a flat command file. Treat the
   overlap as "the substitution and invocation-control fields definitely work; the fork/subagent fields
   are unconfirmed for flat commands."
2. **Whether `disable-model-invocation` is honored on `.claude/commands/` files.** Implied by "same
   frontmatter", not stated.
3. **`.claude/settings.json` full key list.** The settings page paginates its "Available settings" table;
   I captured the file locations, precedence, permissions, `env`, and the keys referenced from other
   pages, but did not enumerate every available key. Fetch
   `https://code.claude.com/docs/en/settings#available-settings` directly if you need exhaustive coverage.
4. **VS Code `inputs` block schema.** I confirmed the path (`.vscode/mcp.json`), the `servers` top-level
   key, and `type`/`command`/`args`/`url`, but did not retrieve the full `inputs` array schema from
   Microsoft's reference page.
5. **Whether `.claude/CLAUDE.md` and `./CLAUDE.md` can coexist and both load.** The docs consistently say
   "either", never what happens if both are present.
6. **`.claude/output-styles/` team adoption path.** `/config` writes `outputStyle` to
   `settings.local.json`; the docs don't explicitly address committing `outputStyle` in
   `.claude/settings.json`, though nothing suggests it wouldn't work (with local overriding project).
7. **The Claude Code changelog** was read from `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md`.
   Entries are dated by version, not calendar date, so "recent" here means "high version number", and I
   could not pin calendar dates to individual changes.
