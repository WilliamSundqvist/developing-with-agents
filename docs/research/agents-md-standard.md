# The `AGENTS.md` convention — state of play, August 2026

Research note, compiled 6 August 2026. Every factual claim below is sourced to a primary source:
the standard's own site/repo, the tool vendor's own documentation, or the raw file in the
repository concerned. No claim rests on a blog aggregator or a search snippet. 19 real instruction
files were fetched raw from `raw.githubusercontent.com` and profiled directly (§4). Anything I
could not confirm from a primary source is quarantined in
[Uncertain / unverified](#uncertain--unverified) rather than smoothed over.

**Contents:** [1 The standard](#1-what-the-standard-actually-is) ·
[2 Adoption matrix](#2-adoption-matrix) ·
[3 What practitioners include/exclude](#3-what-experienced-practitioners-put-in--and-keep-out) ·
[4 Real files](#4-real-files-in-well-known-repositories) ·
[5 "Read this when X" indexes](#5-is-there-a-convention-for-read-this-deeper-doc-when-x-does-it-work) ·
[6 A portable template](#6-what-a-genuinely-portable-agentsmd-looks-like) ·
[7 Uncertain](#uncertain--unverified)

**Bottom line:** `AGENTS.md` has won as the *filename*, but it is not a specification. It mandates
nothing, defines no headings, and does not define merge semantics — each tool implements its own.
The portable file is therefore the *conservative intersection* of ~15 different loaders, not
anything the standard tells you to write.

---

## 1. What the standard actually is

### 1.1 Governance

- `AGENTS.md` was released by OpenAI in August 2025 and, on **9 December 2025**, contributed to the
  **Agentic AI Foundation (AAIF)** under the Linux Foundation, alongside Anthropic's MCP and Block's
  goose. — [Linux Foundation press release](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- The same release cites adoption "by more than 60,000 open source projects and agent frameworks
  including Amp, Codex, Cursor, Devin, Factory, Gemini CLI, GitHub Copilot, Jules and VS Code among
  others." — [ibid.](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- The site now describes itself as "stewarded by the Agentic AI Foundation under the Linux
  Foundation" and credits joint origination across OpenAI, Amp, Google, Cursor and Factory.
  — [agents.md](https://agents.md/)

### 1.2 There is no normative specification

This is the single most important and most misunderstood fact.

- The canonical repository, [`agentsmd/agents.md`](https://github.com/agentsmd/agents.md), contains
  **a Next.js website and nothing else**: `components/`, `pages/`, `public/`, `styles/`, plus
  `README.md`, `AGENTS.md`, `LICENSE`, and build config. There is no `SPEC.md`, no schema, no
  RFC-2119 document, no JSON schema, no conformance suite.
  — [repo file listing](https://github.com/agentsmd/agents.md)
- The site states outright: **"AGENTS.md is just standard Markdown. Use any headings you like; the
  agent simply parses the text you provide."** There are **no required fields**.
  — [agents.md](https://agents.md/)
- The only structure offered is a list of *popular* sections: project overview, build and test
  commands, code style guidelines, testing instructions, security considerations, commit message /
  PR guidelines. These are described as common choices, not requirements.
  — [agents.md](https://agents.md/)
- The repo's own `AGENTS.md` is an ordinary, un-templated file with idiosyncratic headings
  (`## 1. Use the Development Server, not npm run build`, `## 2. Keep Dependencies in Sync`,
  `## 3. Coding Conventions`, `## 4. Useful Commands Recap`) — i.e. the standard does not follow a
  structure of its own. — [raw AGENTS.md](https://raw.githubusercontent.com/agentsmd/agents.md/main/AGENTS.md)

> **Trap:** the *predecessor* proposal did have normative language. `github.com/agentmd/agent.md`
> (singular `AGENT.md`, authored out of Sourcegraph) uses RFC-2119: the file **"MUST be placed in
> the root directory … and MUST use Markdown formatting"**, **"SHOULD contain the following
> sections"**, and **"Implementations SHOULD support multiple AGENT.md files."**
> — [agentmd/agent.md](https://github.com/agentmd/agent.md)
> That is a **different, superseded** document. Amp folded it into `AGENTS.md` on
> **20 August 2025** — the deal was explicitly "if OpenAI can get the agents.md domain, we'll
> switch", and Amp remains "backwards compatible with existing `AGENT.md` files."
> — [Amp: From AGENT.md to AGENTS.md](https://ampcode.com/news/AGENTS.md)
> Do not cite RFC-2119 MUST/SHOULD text as if it were part of today's standard.

### 1.3 Nesting and precedence — as the standard describes it

The site gives exactly two rules, both in prose, both in the FAQ:

- **"Agents automatically read the nearest file in the directory tree, so the closest one takes
  precedence and every subproject can ship tailored instructions."**
- **"The closest AGENTS.md to the edited file wins; explicit user chat prompts override
  everything."**

— both [agents.md](https://agents.md/). The site cites OpenAI's own monorepo as shipping 88 nested
`AGENTS.md` files.

**This description is not what most implementations actually do.** "Nearest wins" implies exclusive
selection; nearly every real loader *concatenates* the whole chain and relies on ordering (later =
more specific = wins on conflict). See [§2.3](#23-three-incompatible-nesting-models). Write your
files so that they are additive and non-contradictory, because you cannot rely on a distant
ancestor file being suppressed.

### 1.4 Migration guidance the site itself gives

- Rename plus symlink for backward compatibility: `mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md`
- Aider: `read: AGENTS.md` in `.aider.conf.yml`
- Gemini CLI: set the context filename in `.gemini/settings.json`

— [agents.md](https://agents.md/). Note that two of the three official bridging recipes are
**config-based**, not symlink-based. The site gives **no Windows caveat** for the symlink recipe
(see [§2.5](#25-symlinks-are-not-a-safe-bridge-on-windows)).

---

## 2. Adoption matrix

Read "Native?" as: does the tool load `AGENTS.md` out of the box, with no configuration?

| Tool | Reads `AGENTS.md` natively? | Its own preferred file(s) | Nesting model | Bridging mechanism | Source |
|---|---|---|---|---|---|
| **OpenAI Codex** (CLI + cloud) | **Yes** — it is the native format. Also `AGENTS.override.md`, and global `~/.codex/AGENTS.md` | `AGENTS.md` | Concatenates **git-root → cwd**, one file per directory; "Files closer to your current directory override earlier guidance because they appear later in the combined prompt". Stops at `project_doc_max_bytes` (**32 KiB** default) | `project_doc_fallback_filenames` in `~/.codex/config.toml` | [learn.chatgpt.com/docs/agent-configuration/agents-md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [config reference](https://learn.chatgpt.com/docs/config-file/config-reference) |
| **Claude Code** | **No.** "Claude Code reads `CLAUDE.md`, not `AGENTS.md`." No runtime setting exists | `CLAUDE.md` / `./.claude/CLAUDE.md`, `CLAUDE.local.md`, `~/.claude/CLAUDE.md`, managed-policy `CLAUDE.md`, plus `.claude/rules/*.md` with `paths:` frontmatter | Ancestors concatenated **root → cwd, in full, at launch**; "All discovered files are concatenated into context rather than overriding each other." Subdirectory files load **lazily** when Claude reads a file there | **Documented:** `@AGENTS.md` import at the top of `CLAUDE.md` (preferred), or `ln -s AGENTS.md CLAUDE.md`. Docs explicitly say use the import on Windows | [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory) |
| **GitHub Copilot** (github.com / coding agent) | **Yes**, as "agent instructions" — `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` — but "currently not supported by all Copilot features" | `.github/copilot-instructions.md` (repo-wide), `.github/instructions/**/*.instructions.md` (path-scoped, `applyTo:` glob) | **Nearest wins**: "the nearest `AGENTS.md` file in the directory tree will take precedence" | None needed; multi-filename support is the bridge | [docs.github.com response-customization](https://docs.github.com/en/copilot/concepts/response-customization), [add-repository-instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions), [changelog 2025-08-28](https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/) |
| **VS Code** (Copilot Chat) | **Yes**, `chat.useAgentsMdFile` defaults to `true`; shipped in **v1.104, August 2025**. Root-only by default | `.github/copilot-instructions.md` (`github.copilot.chat.codeGeneration.useInstructionFiles`, default true); `.github/instructions/*.instructions.md` | **Root-only** unless you opt into `chat.useNestedAgentsMdFiles` (default **false**), which advertises subfolder paths and lets the model choose | Settings toggles; `chat.instructionsFilesLocations` can even point at `~/.claude/rules` (off by default) | [code.visualstudio.com AI settings](https://code.visualstudio.com/docs/agents/reference/ai-settings), [v1.104 release notes](https://code.visualstudio.com/updates/v1_104) |
| **Cursor** | **Yes** — "Create an `AGENTS.md` file in your project root … Cursor picks it up automatically." Also reads `CLAUDE.md` (always applied, ignoring `alwaysApply`) | `.cursor/rules/*.mdc` (frontmatter: `description`, `globs`, `alwaysApply`); legacy `.cursorrules` is deprecated | Merged; "Instructions from nested `AGENTS.md` files are combined with parent directories, with more specific instructions taking precedence" — applied **downward from the edited file**, not only up from cwd | None needed; multi-format support is the bridge | [cursor.com/docs/context/rules](https://cursor.com/docs/context/rules) |
| **Windsurf** (now **Devin Desktop**; `docs.windsurf.com` → `docs.devin.ai/desktop`) | **Yes**, zero-config, case-insensitive (`AGENTS.md` or `agents.md`); earliest changelog entry **v1.12.25, 23 Oct 2025** | `.devin/rules/*.md` (preferred) or `.windsurf/rules/*.md`; legacy `.windsurfrules`; global `~/.codeium/windsurf/memories/global_rules.md` | Root file = "always-on" rule; a subdirectory file becomes a **glob rule of `<directory>/**`**; searches parent dirs up to the git root. All merged, nothing overridden | Native. Rule files capped at **12,000 chars** each (**6,000** for the global file) | [docs.devin.ai/desktop/cascade/agents-md](https://docs.devin.ai/desktop/cascade/agents-md), [memories](https://docs.devin.ai/desktop/cascade/memories) |
| **Amp** (Sourcegraph) | **Yes** — co-author of the standard. `AGENT.md` shipped 7 May 2025; renamed 20 Aug 2025 | `AGENTS.md`; per-directory fallback chain `AGENTS.md` → `AGENT.md` → `CLAUDE.md`; `$HOME/.config/amp/AGENTS.md`; org-wide `/etc/ampcode/AGENTS.md` etc. | cwd + **all parents up to `$HOME`** always included; **subtree files included when the agent reads a file in the subtree**. Everything concatenated | Native, plus `@file.md` mentions inside the agent file (globs supported), plus `globs:` frontmatter in the mentioned file. Documented symlink recipes for migrating from Claude Code / Cursor | [ampcode.com/manual](https://ampcode.com/manual), [multiple-AGENT.md-files](https://ampcode.com/news/multiple-AGENT.md-files) |
| **Gemini CLI** (Google) | **No.** Default is `GEMINI.md` only — `DEFAULT_CONTEXT_FILENAME = 'GEMINI.md'` in source; `context.fileName` defaults to undefined | `GEMINI.md` (global `~/.gemini/GEMINI.md` + project + ancestors) | Pure **concatenation**, root → leaf, no precedence; plus just-in-time discovery when a tool touches a directory. `context.discoveryMaxDirs` default 200 | **Config:** `"context": { "fileName": ["AGENTS.md", "GEMINI.md"] }` in `.gemini/settings.json` — **accepts an array**. Also `@./path.md` imports | [memoryTool.ts](https://raw.githubusercontent.com/google-gemini/gemini-cli/main/packages/core/src/tools/memoryTool.ts), [gemini-md.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md), [settings.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/settings.md) |
| **Jules** (Google) | **Yes** — "Jules automatically looks for a file named `AGENTS.md` in the root of your repository." Changelog **20 June 2025** | None. Jules-specific config is a UI-entered setup script, not a file | Documented as **root-only**; nested behaviour not documented either way | None needed | [jules.google/docs](https://jules.google/docs/), [changelog](https://jules.google/docs/changelog/), [environment](https://jules.google/docs/environment/) |
| **Devin** (Cognition) | **Yes**, both surfaces. Cloud: "Just put an `AGENTS.md` file in your project root (or anywhere else)." CLI: "Devin CLI reads this file automatically … the recommended approach for project rules" | Cloud: the **Knowledge** base (web UI), which also auto-ingests `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.mdc`, `.windsurf`. CLI: `AGENTS.md`, `AGENTS.local.md`, `AGENT.md`, `.windsurfrules`, `CLAUDE.md` all "treated identically"; `.devin/rules/*.md`; global `~/.config/devin/AGENTS.md` | CLI: workspace-root files eager at session start, **subdirectory files discovered lazily** when the agent accesses that directory. Global and project rules "both are loaded and active at the same time" | **Config:** `read_config_from: { agents_standard, cursor, windsurf, claude }` in `~/.config/devin/config.json`. Always-on rule files capped at **32 KiB** each, truncated with a hint | [docs.devin.ai/onboard-devin/agents-md](https://docs.devin.ai/onboard-devin/agents-md), [cli/extensibility/rules](https://docs.devin.ai/cli/extensibility/rules), [cli changelog](https://docs.devin.ai/cli/changelog/stable) |
| **Zed** | **Yes**, but **7th in a first-match-wins list** (see below) | `.rules`; personal `~/.config/zed/AGENTS.md` (`%APPDATA%\Zed\AGENTS.md` on Windows) | **First match wins**, single file: `.rules` → `.cursorrules` → `.windsurfrules` → `.clinerules` → `.github/copilot-instructions.md` → `AGENT.md` → `AGENTS.md` → `CLAUDE.md` → `GEMINI.md`. "Project instructions override personal `AGENTS.md` when they conflict." No documented subdirectory discovery | The filename list *is* the bridge. Caveat from the docs: "External Agents and Terminal Threads may read their own native instruction files directly. Do not assume Zed's instruction loader controls those agents." | [zed.dev/docs/ai/instructions](https://zed.dev/docs/ai/instructions) |
| **Aider** | **No.** Nothing is auto-loaded from the tree at all | `CONVENTIONS.md` — by documented convention only; the filename is not special-cased | **None.** No directory-tree walking of any kind | **Config:** `read: AGENTS.md` in `.aider.conf.yml`, or `--read AGENTS.md` / `/read AGENTS.md`. Loading it read-only also makes it cacheable | [aider.chat/docs/usage/conventions.html](https://aider.chat/docs/usage/conventions.html), [aider_conf.html](https://aider.chat/docs/config/aider_conf.html) |
| **Cline** | **Yes**, listed as a first-class detected format; also a global `~/.agents/AGENTS.md` | `.clinerules/` **directory** (all `.md`/`.txt` inside combined); global rules dir under `Documents/Cline/Rules` | Workspace + global **combined**; "Workspace rules take precedence when they conflict with global rules." Repo-subdirectory nesting not documented | Native; also auto-detects `.cursorrules` and `.windsurfrules`. Conditional rules use YAML frontmatter globs | [docs.cline.bot/customization/cline-rules](https://docs.cline.bot/customization/cline-rules) |
| **Roo Code** | **Yes**, on by default, with `AGENT.md` as fallback; "If both exist, `AGENTS.md` is preferred over `AGENT.md`" | `.roo/rules/` (preferred), `.roorules` (fallback), mode-scoped `.roo/rules-{mode}/` and `.roorules-{mode}` | Global then workspace, **aggregated not either-or**; workspace wins on conflict. Recursive within rules dirs, sorted by basename, case-insensitive | Native. Disable with `"roo-cline.useAgentRules": false`. **Ordering matters:** `AGENTS.md` is injected *after* mode-specific rules but *before* generic `.roo/rules/` | [roocodeinc.github.io/Roo-Code/features/custom-instructions](https://roocodeinc.github.io/Roo-Code/features/custom-instructions) |
| **opencode** | **Yes** — `AGENTS.md` is its primary format | `AGENTS.md`; global `~/.config/opencode/AGENTS.md`; falls back to `CLAUDE.md`, then `~/.claude/CLAUDE.md` | Traverses **upward** from cwd; "The first matching file wins in each category" | `instructions` array in `opencode.json` (supports globs and remote URLs), combined with AGENTS.md | [opencode.ai/docs/rules](https://opencode.ai/docs/rules/) |
| **goose** (Block) | **Yes** — first default context filename | `.goosehints` (local, any level); `~/.config/goose/.goosehints` | Hierarchical cwd → repo root, plus lazy discovery in subdirectories; once loaded for a directory they stay active for the session. Local beats global on conflict | `CONTEXT_FILE_NAMES` env var, a JSON array; default `["AGENTS.md", ".goosehints"]` | [goose-docs.ai/docs/guides/context-engineering/using-goosehints](https://goose-docs.ai/docs/guides/context-engineering/using-goosehints/) |
| **JetBrains Junie** | **Yes** — now the *primary* format; `.junie/guidelines.md` is explicitly **legacy** | Discovery order `.junie/AGENTS.md` → `AGENTS.md` → `.junie/guidelines.md` \| `.junie/guidelines/`; global `~/.junie/AGENTS.md` | Project root + global only; nesting not documented. Both global and project included, project wins on conflict, identical content deduplicated | Native | [junie.jetbrains.com/docs/guidelines-and-memory.html](https://junie.jetbrains.com/docs/guidelines-and-memory.html) |

### 2.1 The two holdouts

Only **Claude Code** and **Gemini CLI** do not read `AGENTS.md` at runtime.

- Claude Code is the only tool that ships an explicit, documented bridging recipe *because* it
  doesn't read the file. Both forms are in the docs:

  ```markdown
  <!-- CLAUDE.md -->
  @AGENTS.md

  ## Claude Code
  Use plan mode for changes under `src/billing/`.
  ```

  or `ln -s AGENTS.md CLAUDE.md`. — [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

- Gemini CLI needs one settings key, and it accepts an array so you can keep both filenames:
  `{"context": {"fileName": ["AGENTS.md", "GEMINI.md"]}}` in `.gemini/settings.json`.
  — [settings.md](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/settings.md)

Everything else in the matrix either reads it natively or offers a one-line config override.
**No tool in this set actually requires a symlink.**

### 2.2 Stub-pointer vs symlink

| Pattern | Where it is officially documented | Notes |
|---|---|---|
| `CLAUDE.md` containing `@AGENTS.md` | [Claude Code memory docs](https://code.claude.com/docs/en/memory) | Preferred. Lets you append Claude-specific content below the import. Import depth max **4 hops**; relative paths resolve against the *importing file*; imports inside backticks or code fences are ignored |
| `ln -s AGENTS.md CLAUDE.md` | [Claude Code memory docs](https://code.claude.com/docs/en/memory); [agents.md](https://agents.md/) (for `AGENT.md`); [Amp manual](https://ampcode.com/manual) (for Cursor/Claude migration) | Works on POSIX. **Breaks on Windows checkouts** — see below |
| Config key naming the file | Gemini CLI `context.fileName`; Aider `read:`; Codex `project_doc_fallback_filenames`; Devin `read_config_from`; goose `CONTEXT_FILE_NAMES`; opencode `instructions` | Most robust. Cross-platform, survives clone, explicit |
| Native multi-filename support | Copilot, Cursor, Zed, Amp, Devin CLI, opencode, Junie | Zero work, but see Zed's ordering trap |

### 2.3 Three incompatible nesting models

Despite the standard's "nearest file wins", implementations split into three families:

1. **Concatenate the ancestor chain, later wins on conflict** — Codex, Claude Code, Gemini CLI,
   Amp, goose, Cursor, Windsurf/Devin Desktop. The distant root file is *still in context*; it is
   not suppressed.
2. **True nearest-wins / first-match-wins** — GitHub Copilot on github.com ("the nearest `AGENTS.md`
   file in the directory tree will take precedence"); Zed (first match across a filename list);
   opencode ("first matching file wins in each category").
3. **Root-only** — VS Code by default (`chat.useNestedAgentsMdFiles` is `false`), Jules, Aider
   (which walks nothing).

**Practical consequence:** never write a subdirectory `AGENTS.md` that *contradicts* the root one.
Under family 1 both are in context and the model arbitrates; under family 3 the subdirectory file
may never load at all. Write subdirectory files to be purely **additive**.

### 2.4 Documented size caps

| Tool | Cap | Behaviour at the cap | Source |
|---|---|---|---|
| OpenAI Codex | `project_doc_max_bytes`, **32 KiB** default (combined) | "stops adding files once the combined size reaches the limit" — silently drops further files | [learn.chatgpt.com](https://learn.chatgpt.com/docs/agent-configuration/agents-md) |
| Devin CLI | **32 KiB** per always-on rule file | "Oversized rules are truncated with a hint pointing at the source path" | [docs.devin.ai/cli/changelog/stable](https://docs.devin.ai/cli/changelog/stable) |
| Windsurf / Devin Desktop | **12,000 chars** per workspace rule file; **6,000** for the global file | Documented limit | [docs.devin.ai/desktop/cascade/memories](https://docs.devin.ai/desktop/cascade/memories) |
| Claude Code | No hard cap — "CLAUDE.md files are loaded in full regardless of length" | Soft guidance: "target under 200 lines per CLAUDE.md file" | [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory) |
| GitHub Copilot | No enforced cap documented | Editorial guidance: "Instructions must be no longer than 2 pages" | [github.blog 5 tips](https://github.blog/ai-and-ml/github-copilot/5-tips-for-writing-better-custom-instructions-for-copilot/) |

The binding constraint for a portable file is therefore **~12,000 characters** (Windsurf) —
comfortably above any file you should actually be writing.

### 2.5 Symlinks are not a safe bridge on Windows

Primary sources, in order of authority:

- **Git's own config docs** define the failure mode precisely: *"If false, symbolic links are
  checked out as small plain files that contain the link text… The default is true, except
  `git-clone` or `git-init` will probe and set `core.symlinks` false if appropriate when the
  repository is created."* — [git-scm.com/docs/git-config](https://git-scm.com/docs/git-config)

  So on a machine without symlink capability, `CLAUDE.md` lands on disk as a plain text file whose
  entire contents are the string `AGENTS.md`. Not an error, not empty — an agent reads nine bytes of
  garbage. **Silent failure.** And because the probe happens at clone time on the *cloning* machine,
  nothing you commit can fix it for that contributor.

- **Git for Windows** disables symlinks by default; enabling needs `core.symlinks=true` (e.g.
  `git clone -c core.symlinks=true <URL>`) and the `SeCreateSymbolicLinkPrivilege`, "granted by
  default only to Administrators and guarded by UAC". Developer Mode (Windows 10 1703+) lifts the
  restriction. — [gitforwindows.org/symbolic-links.html](https://gitforwindows.org/symbolic-links.html)

- **Microsoft** grants `SeCreateSymbolicLinkPrivilege` to Administrators by default and advises
  *"Don't assign the Create symbolic links user right to standard users."*
  — [Microsoft Learn: Create symbolic links](https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/create-symbolic-links)

- Developer Mode is the documented escape hatch — *"any user on the machine can run the mklink
  command without elevating"* ([Windows Developer Blog](https://blogs.windows.com/windowsdeveloper/2016/12/02/symlinks-windows-10/))
  — but enabling it *"requires administrator access. If your device is owned by an organization,
  this option may be disabled."*
  — [Microsoft Learn: enable your device for development](https://learn.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development)

- **Anthropic documents this explicitly**: *"On Windows, creating a symlink requires Administrator
  privileges or Developer Mode, so use the `@AGENTS.md` import instead."*
  — [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

- **Neither agents.md nor GitHub's docs mention the caveat.** agents.md recommends
  `ln -s AGENTS.md AGENT.md` with no platform note; GitHub's instruction-file docs do not mention
  symlinks at all. Treat the spec site's recipe as POSIX-only advice.

**Recommendation: use committed stub files, not symlinks.** A one-line `CLAUDE.md` containing
`@AGENTS.md` is a real file in git, is byte-identical on every platform, and lets you append
tool-specific content.

---

## 3. What experienced practitioners put in — and keep out

### 3.1 Anthropic (Claude Code docs)

The most explicit include/exclude table published by any vendor:

| ✅ Include | ❌ Exclude |
|---|---|
| Bash commands Claude can't guess | Anything Claude can figure out by reading code |
| Code style rules that differ from defaults | Standard language conventions Claude already knows |
| Testing instructions and preferred test runners | Detailed API documentation (link to docs instead) |
| Repository etiquette (branch naming, PR conventions) | Information that changes frequently |
| Architectural decisions specific to your project | Long explanations or tutorials |
| Developer environment quirks (required env vars) | File-by-file descriptions of the codebase |
| Common gotchas or non-obvious behaviors | Self-evident practices like "write clean code" |

— [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)

Other load-bearing lines from the same source:

- The editing test: *"For each line, ask: 'Would removing this cause Claude to make mistakes?' If
  not, cut it."*
- The core failure mode, stated bluntly: **"Bloated CLAUDE.md files cause Claude to ignore your
  actual instructions!"**
- The diagnostic: *"If Claude keeps doing something you don't want despite having a rule against it,
  the file is probably too long and the rule is getting lost. If Claude asks you questions that are
  answered in CLAUDE.md, the phrasing might be ambiguous."*
- Maintenance posture: *"Treat CLAUDE.md like code: review it when things go wrong, prune it
  regularly, and test changes by observing whether Claude's behavior actually shifts."*
- Emphasis works: *"You can tune instructions by adding emphasis (e.g., 'IMPORTANT' or 'YOU MUST')
  to improve adherence."*
- The listed anti-pattern: **"The over-specified CLAUDE.md. If your CLAUDE.md is too long, Claude
  ignores half of it because important rules get lost in the noise. Fix: Ruthlessly prune. If Claude
  already does something correctly without the instruction, delete it or convert it to a hook."**

From the memory docs ([code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)):

- **Size target: "target under 200 lines per CLAUDE.md file. Longer files consume more context and
  reduce adherence."**
- Specificity: *"Use 2-space indentation" instead of "Format code properly"*; *"Run `npm test`
  before committing" instead of "Test your changes"*.
- Consistency: *"if two rules contradict each other, Claude may pick one arbitrarily."*
- The honest disclaimer: *"CLAUDE.md content is delivered as a user message after the system prompt,
  not as part of the system prompt itself… there's no guarantee of strict compliance."* And:
  *"Claude treats them as context, not enforced configuration. To block an action regardless of what
  Claude decides, use a PreToolUse hook instead."*
- Trigger for adding an entry: *"Claude makes the same mistake a second time."*
- Staleness is called out directly: *"Revisit after major model releases: instructions that worked
  around an older model's limitation may become overhead once a newer model handles the case on its
  own."* — [large-codebases](https://code.claude.com/docs/en/large-codebases)
- There is now a tool for the bloat problem: `/doctor` *"proposes trims for a checked-in CLAUDE.md:
  it cuts content Claude can derive from the codebase, such as directory layouts, dependency lists,
  and architecture overviews, and keeps pitfalls, rationale, and conventions that differ from tool
  defaults."*

### 3.2 OpenAI (Codex docs)

Recommended contents: *"repo layout and important directories"*, *"How to run the project"*,
*"Build, test, and lint commands"*, *"Engineering conventions and PR expectations"*,
*"Constraints and do-not rules"*, *"What done means and how to verify work"*.

- Length: **"A short, accurate `AGENTS.md` is more useful than a long file full of vague rules."**
- The iteration loop: **"When Codex makes the same mistake twice, ask it for a retrospective and
  update `AGENTS.md`"** so guidance *"stays practical and based on real friction."*
- Structure at scale: *"keep the main file concise and reference task-specific markdown files."*
- Named anti-pattern: *"Overloading the prompt with durable rules instead of moving them into
  `AGENTS.md`."*

— [learn.chatgpt.com/guides/best-practices](https://learn.chatgpt.com/guides/best-practices)

The Codex config docs add: empty files are ignored, excessive length should be split across
directories, and CI-level checks belong in CI rather than the file.
— [learn.chatgpt.com/docs/agent-configuration/agents-md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

### 3.3 GitHub

Five things to cover: a short project overview ("a few sentences"), the tech stack, coding
guidelines, project structure ("a quick `ls` command" equivalent), and pointers to available
scripts/resources.

- **Hard length guidance: "Instructions must be no longer than 2 pages."**
- *"An 'imperfect' instructions file will deliver far more impact than nothing at all."*
- *"Your instructions file should also evolve over time, just like documentation."*

— [github.blog: 5 tips for writing better custom instructions](https://github.blog/ai-and-ml/github-copilot/5-tips-for-writing-better-custom-instructions-for-copilot/)

> ⚠️ **Citation trap.** GitHub's post *"How to write a great agents.md: Lessons from over 2,500
> repositories"* is **not about the root `AGENTS.md` standard.** It is about Copilot **custom
> agents** stored at `.github/agents/<name>.md`, each with `name:`/`description:` frontmatter and a
> persona, invoked as `@docs-agent`. Its template (`## Persona`, `## Boundaries`, the ✅/⚠️/🚫
> three-tier system) is guidance for *that* file type. GitHub's own docs describe agent instructions
> (`AGENTS.md`/`CLAUDE.md`/`GEMINI.md`) without any frontmatter or persona requirement. Widely
> miscited; do not treat its structure as `AGENTS.md` guidance.
> — [the post](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/) vs [docs.github.com](https://docs.github.com/en/copilot/concepts/response-customization)

### 3.4 Amp / Sourcegraph

- Purpose: *"guidance on project structure, build & test steps, conventions, and avoiding common
  mistakes"* — and the reason for the standard: *"We chose `AGENT.md` as a naming standard to avoid
  the proliferation of agent-specific files in your repositories."*
  — [ampcode.com/news/AGENT.md](https://ampcode.com/news/AGENT.md)
- Contents in the manual: *"Architecture, build/test commands, overview of internal APIs, review and
  release steps."*
- Monorepo posture: *"In a large repository with multiple subprojects, we recommend keeping the
  top-level `AGENTS.md` general and creating more specific `AGENTS.md` files in subtrees for each
  subproject."* — [ampcode.com/manual](https://ampcode.com/manual)

### 3.5 The underlying reason all of this converges on "keep it short"

Anthropic's context-engineering write-up states the mechanism: *"As the number of tokens in the
context window increases, the model's ability to accurately recall information from that context
decreases"*, a consequence of transformer attention producing *"n² pairwise relationships for n
tokens"*. Its prescription for instruction altitude: *"The optimal altitude strikes a balance:
specific enough to guide behavior effectively, yet flexible enough to provide the model with strong
heuristics to guide behavior."*
— [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

### 3.6 Documented failure modes, consolidated

| Failure mode | Documented by | Fix per source |
|---|---|---|
| **Bloat → ignored instructions** | Anthropic: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!" | Prune; ask "would removing this cause a mistake?"; run `/doctor` |
| **Contradictory rules** | Anthropic: "if two rules contradict each other, Claude may pick one arbitrarily" | Review nested files and rules periodically; keep subdirectory files additive |
| **Stale rules outliving the model limitation they patched** | Anthropic (large-codebases): "Revisit after major model releases" | Review CLAUDE.md edits in PRs like any doc change |
| **Vague rules** | OpenAI: "a long file full of vague rules"; Anthropic specificity examples | Make every rule concretely verifiable |
| **Instructions that must always run being written as prose** | Anthropic: "Because they're context rather than enforced configuration…" / "use a PreToolUse hook instead" | Convert to a hook / CI check, delete from the file |
| **Same mistake repeating** | OpenAI: "ask it for a retrospective and update AGENTS.md"; Anthropic: add when "Claude makes the same mistake a second time" | Treat the file as a bug-fix log, not an upfront design doc |
| **Durable rules left in the chat prompt** | OpenAI: "Overloading the prompt with durable rules instead of moving them into `AGENTS.md`" | Promote repeated prompt text into the file |

---

## 4. Real files in well-known repositories

19 files were fetched raw (not from search snippets) and profiled, plus 12 companion stub files
verified. Line/word counts are of the fetched file.

| Repo | File | Size | Ordered top-level sections |
|---|---|---|---|
| [openai/codex](https://raw.githubusercontent.com/openai/codex/main/AGENTS.md) | `AGENTS.md` | ~850 ln | (untitled Rust/style preamble) → `The codex-core crate` → `Code Review Rules` → `TUI style conventions` → `TUI code conventions` → `Tests` → `App-server API Development Best Practices` → `Python Development Best Practices` → `Platform Support` |
| [openai/openai-agents-python](https://raw.githubusercontent.com/openai/openai-agents-python/main/AGENTS.md) | `AGENTS.md` | — | `Policies & Mandatory Rules` → `Project Structure Guide` → `Operation Guide` → `Code Review Rules` |
| [openai/openai-cookbook](https://raw.githubusercontent.com/openai/openai-cookbook/main/AGENTS.md) | `AGENTS.md` | 50 ln / 821 w | `Project Structure & Module Organization` → `Build, Test, and Development Commands` → `Coding Style & Naming Conventions` → `Testing Guidelines` → `Commit & Pull Request Guidelines` → `Metadata & Publication Workflow` → `Review Guidelines` → `Recent Learnings` |
| [cloudflare/workers-sdk](https://raw.githubusercontent.com/cloudflare/workers-sdk/main/AGENTS.md) | `AGENTS.md` | 247 ln / 1,908 w | `Project Overview` → `Development Commands` → `Architecture Overview` → **`WHERE TO LOOK`** → `Development Guidelines` → `Key Locations` → `Testing Strategy` → `Changesets` → `Anti-Patterns` → `Subdirectory Knowledge` → `Cloudflare Workers Specifics` → `Adding Native Node.js Module Support` |
| [cloudflare/agents](https://raw.githubusercontent.com/cloudflare/agents/main/AGENTS.md) | `AGENTS.md` | 196 ln / 1,182 w | `Project overview` → `Repository structure` → `Nested AGENTS.md files` → `Setup` → `Commands` → `Code standards` → `Testing` → `Contributing` → `Learned Workspace Facts` → `Learned User Preferences` → **`Boundaries`** |
| [vercel/ai](https://raw.githubusercontent.com/vercel/ai/main/AGENTS.md) | `AGENTS.md` | 320 ln / 1,592 w | `Project Overview` → `Repository Structure` → `Development Setup` → `Development Commands` → `Core APIs` → `Import Patterns` → `Coding Standards` → `Error Pattern` → `ADRs` → `Project Philosophies` → `Architecture` → `Contributing Guides` → `Changesets` → `Task Completion Guidelines` → **`Do Not`** |
| [ghostty-org/ghostty](https://raw.githubusercontent.com/ghostty-org/ghostty/main/AGENTS.md) | `AGENTS.md` | **39 ln / 214 w** | `Commands` → `libghostty-vt` → `Directory Structure` → `Issue and PR Guidelines` |
| [apache/airflow](https://raw.githubusercontent.com/apache/airflow/main/AGENTS.md) | `AGENTS.md` | 519 ln / 4,901 w | **`Naming`** → `Environment Setup` → `Commands` → `Repository Structure` → `Architecture Boundaries` → `Security Model` → `Coding Standards` → `Testing Standards` → `Output conventions` → `Commits and PRs` → `Boundaries` → `References` |
| [temporalio/temporal](https://raw.githubusercontent.com/temporalio/temporal/main/AGENTS.md) | `AGENTS.md` | 104 ln / 1,203 w | `Core Mandates` → `Tone and Style` → `Development Guide` → `Primary Workflows` |
| [astral-sh/ruff](https://raw.githubusercontent.com/astral-sh/ruff/main/AGENTS.md) | `AGENTS.md` | 168 ln / 1,974 w | `Code Review Rules` → `Running Tests` → `Writing mdtests` → `Running Clippy` → `Running Debug Builds` → `Working on ty` → `Generated Release Workflow` → `Development Guidelines` |
| [astral-sh/uv](https://raw.githubusercontent.com/astral-sh/uv/main/AGENTS.md) | `AGENTS.md` | **25 ln / 279 w** | **no headings** — 22 flat bullets, each opening `ALWAYS` / `NEVER` / `PREFER` / `AVOID` |
| [tldraw/tldraw](https://raw.githubusercontent.com/tldraw/tldraw/main/AGENTS.md) | `AGENTS.md` | 208 ln / 1,620 w | `Core rules` → `Repo overview` → `Setup` → `Common commands` → `Validation workflow` → `Architecture notes` → `Where to work` → `Testing guidance` → `Documentation and examples` → `Skills` → `Code conventions` → `Writing style` → `Git and PR notes` |
| [PostHog/posthog](https://raw.githubusercontent.com/PostHog/posthog/master/AGENTS.md) | `AGENTS.md` | 268 ln / 5,032 w | `Codebase Structure` → `Commands` → `Commits and Pull Requests` → `CI / GitHub Actions` → `Security` → `Architecture guidelines` → `Code Style` → `User-facing copy` → **`Agent automation`** |
| [langchain-ai/langchain](https://raw.githubusercontent.com/langchain-ai/langchain/master/AGENTS.md) | `AGENTS.md` | 364 ln / 2,510 w | `Project architecture and context` → `Core development principles` → `Model profiles` → `CI/CD infrastructure` → `GitHub Actions & Workflows` → `Additional resources` |
| [home-assistant/core](https://raw.githubusercontent.com/home-assistant/core/dev/AGENTS.md) | `AGENTS.md` | 56 ln / 843 w | `Git Commit Guidelines` → `Pull Requests` → `Development Commands` → `Python Syntax Notes` → `Testing` → `Good practices` → **`AI policy`** |
| [huggingface/transformers](https://raw.githubusercontent.com/huggingface/transformers/main/.ai/AGENTS.md) | `.ai/AGENTS.md` | 49 ln / 570 w | `Useful commands` → `Local agent setup` → `Copies and Modular Models` |
| [sst/opencode](https://raw.githubusercontent.com/sst/opencode/dev/AGENTS.md) | `AGENTS.md` | 161 ln / 1,234 w | (5 bare rule bullets, no H1) → `Branch Names` → `Commits and PR Titles` → `Style Guide` → `Testing` → `Type Checking` → `V2 Session Core` |
| [microsoft/vscode](https://raw.githubusercontent.com/microsoft/vscode/main/.github/copilot-instructions.md) | `.github/copilot-instructions.md` | 154 ln / 1,588 w | `Project Overview` → `Validating TypeScript changes` → `Coding Guidelines` → `Learnings` |
| [zed-industries/zed](https://raw.githubusercontent.com/zed-industries/zed/main/.rules) | `.rules` | 188 ln / 1,750 w | `Rust coding guidelines` → `Timers in tests` → `GPUI` (9 subsections) → `Pull request hygiene` → `Crash Investigation` → **`Rules Hygiene`** |
| [anthropics/claude-cookbooks](https://raw.githubusercontent.com/anthropics/claude-cookbooks/main/CLAUDE.md) | `CLAUDE.md` | 111 ln / 469 w | `Quick Start` → `Development Commands` → `Code Style` → `Git Workflow` → `Key Rules` → `Slash Commands` → `Project Structure` → `Adding a New Cookbook` |

Checked and found to have **no** agent instruction file at all: `vercel/next.js`, `expo/expo`,
`shadcn-ui/ui`, `mrdoob/three.js`, `temporalio/sdk-typescript`, `anthropics/claude-code`,
`anthropics/anthropic-sdk-python`. `django/django` and `supabase/supabase` have only a thin
`.github/copilot-instructions.md`.

### 4.1 Recurring section structure

Ranked by how many of the 19 files carry a section on the theme:

| Rank | Theme | n | Observed heading variants |
|---:|---|---:|---|
| 1 | **Commands / build-test-run** | 16 | `Development Commands` (×4, the most common exact string), `Commands`, `Common commands`, `Build, Test, and Development Commands`, `Useful commands`, `Running Tests` |
| 2 | **Code style / conventions** | 13 | `Code Style`, `Coding Standards`, `Coding Guidelines`, `Style Guide`, `Code conventions`, `Development Guidelines`, `Core development principles` |
| 3 | **Repo structure / overview** | 12 | `Project Overview` (×3), `Repository Structure` (×2), `Project Structure` (×2), `Codebase Structure`, `Directory Structure` |
| 4 | **Commits / PRs / git** | 11 | `Commits and PRs`, `Commit & Pull Request Guidelines`, `Git Workflow`, `Pull request hygiene`, `Branch Names` |
| 5 | **Testing** | 10 | `Testing` (×3), `Testing Guidelines`, `Testing Standards`, `Testing Strategy`, `Testing guidance` |
| 6 | **Setup / environment** | 7 | `Setup` (×2), `Development Setup`, `Environment Setup`, `Local Setup`, `Quick Start` |
| 7 | **Explicit prohibitions** | 7 | `Do Not`, `Anti-Patterns`, `Boundaries` (×2), `What NOT to put in .rules`, uv's all-`NEVER` bullet file |
| 8 | **Architecture as its own section** | 6 | `Architecture Overview`, `Architecture notes`, `Architecture guidelines`, `Architecture Boundaries` |
| 9 | **Agent memory / learnings** | 5 | `Recent Learnings`, `Learnings`, `Learned Workspace Facts`, `Learned User Preferences`, `Rules Hygiene` |
| 10 | **Pointers to deeper docs** | 4 | `References`, `Additional resources`, `Contributing Guides`, `Architecture Decision Records` |
| 11 | **File map / task routing** | 3 | `WHERE TO LOOK`, `Key Locations`, `Where to work` |
| 12 | CI / Security / Changesets / Skills | 2 each | `CI / GitHub Actions`, `Security Model`, `Changesets`, `Skills`, `Agent automation` |

**The near-universal spine is five sections:** Overview/Structure → Commands → Code Style →
Testing → Commits/PRs. Fourteen of nineteen files are that spine plus one to four repo-specific
additions. Note that this spine matches the "popular choices" list on
[agents.md](https://agents.md/) almost exactly — convergent practice, not imposed structure.

### 4.2 Length

- **Range:** 25 lines / 279 words ([astral-sh/uv](https://raw.githubusercontent.com/astral-sh/uv/main/AGENTS.md))
  to 1,017 lines / 4,664 words ([browser-use](https://raw.githubusercontent.com/browser-use/browser-use/main/AGENTS.md)).
- **Median: ~168 lines / ~1,300 words (~9 KB).**
- **Sweet spot: 150–270 lines / 1,200–2,000 words**, where 9 of 19 land.
- Both tails fail in opposite directions. `browser-use/AGENTS.md` is titled "AGENTS.md Version 2"
  and is the product's **end-user documentation** pasted into the agent file — parameter reference
  tables, LLM provider setup, telemetry opt-out — with only the first ~35 lines being contributor
  instructions, and duplicated headings. It is the textbook instance of Anthropic's "over-specified"
  failure mode. `astral-sh/uv` gets away with 25 lines only because bullet #1 delegates everything
  else to `CONTRIBUTING.md`.
- Note line count and word count diverge sharply: PostHog is 268 lines but 5,032 words (dense
  prose); vercel/ai is 320 lines but 1,592 words (short bullets and code blocks). Word count is the
  better proxy for context cost.

### 4.3 The dominant bridging convention in the wild

Of the 12 repos in this set carrying both files, **11 make `CLAUDE.md` the pointer and `AGENTS.md`
the source of truth. Zero do it the other way round.** Three mechanisms:

1. **Git symlink** — blob content is just the target path, 6–13 bytes. Used by
   [zed](https://github.com/zed-industries/zed) (`AGENTS.md` and `CLAUDE.md` → `.rules`),
   [huggingface/transformers](https://github.com/huggingface/transformers) (both → `.ai/AGENTS.md`),
   vercel/ai, ghostty, airflow, PostHog, home-assistant.
2. **Claude `@import` stub** — an 11-byte real file containing `@AGENTS.md`. Used by ruff, uv,
   tldraw. Cloudflare workers-sdk uses the polite variant: a 132-byte real file with a sentence of
   context plus `See @AGENTS.md`.
3. **Human-prose pointer** — `microsoft/vscode` inverts the direction: a 271-byte `AGENTS.md`
   whose body points at `.github/copilot-instructions.md`.

The two exceptions are exactly the failure the convention exists to prevent:
**langchain** keeps `CLAUDE.md` byte-identical to `AGENTS.md` (a manual-sync duplicate), and
**browser-use** has let them diverge into two genuinely different documents — 11,149 bytes on
`main` versus a different 6,502-byte file on `dev`.

> Given [§2.5](#25-symlinks-are-not-a-safe-bridge-on-windows), note that 7 of these 11 chose the
> mechanism that silently degrades on a Windows clone without Developer Mode. The 11-byte
> `@AGENTS.md` stub (ruff, uv, tldraw) is the same convention without the platform hazard.

### 4.4 Four patterns worth stealing

- **A task-routing table.** `cloudflare/workers-sdk`'s `## WHERE TO LOOK` is a three-column
  Task | Location | Notes table. For an agent that needs to find the right file on the first try,
  this beats prose architecture description. `tldraw` (`Where to work`) and `workers-sdk`
  (`Key Locations`) do the same thing.
- **The Always / Ask first / Never triad.** `cloudflare/agents` and `apache/airflow` arrived at it
  independently. It separates hard prohibitions from the escalation surface, which a flat bullet
  list never does. (This is also the three-tier system GitHub's custom-agents post recommends —
  see the citation caveat in §3.3.)
- **Rules about the rules file.** `zed/.rules` closes with `# Rules Hygiene`: a high bar for new
  rules, an explicit "what NOT to put in `.rules`", "no drive-by additions", and a post-session
  review step. It is the only file in the set that constrains its own growth — the direct antidote
  to the bloat failure mode, and the thing every long file here is missing.
- **A bounded learnings log.** `openai-cookbook` (`## Recent Learnings`, a strict
  `**symptom** -> fix -> why it matters` triple), `microsoft/vscode` (`## Learnings`), and
  `cloudflare/agents` (separate `Learned Workspace Facts` and `Learned User Preferences` buckets)
  all keep an append-only tail. This is the durable form of OpenAI's "when Codex makes the same
  mistake twice, update AGENTS.md" loop — but it needs §4.4's hygiene rule to stop it growing
  without bound.

### 4.5 Two structural outliers worth knowing about

- **`temporalio/temporal/AGENTS.md` is a persona, not a repo guide.** It opens *"You are an
  experienced developer working on the temporal project… Your background is in distributed
  systems"* and its `# Tone and Style` section dictates the agent's chat output ("fewer than 3
  lines", "No Chitchat"). Large parts read as lifted from a default CLI system prompt. This is a
  distinct genre and does not port — tone instructions are wasted on a cloud coding agent.
- **`home-assistant/core` has an `## AI policy` section** citing the Open Home Foundation policy:
  *"Autonomous contributions are not accepted: a human must review, understand, and be able to
  explain every change"*, plus a ban on the agent opening issues/PRs or commenting autonomously.
  The only file in the set that constrains agent autonomy on governance rather than technical
  grounds. Worth copying for any project accepting outside contributions.

---

## 5. Is there a convention for "read this deeper doc when X"? Does it work?

**Yes, and it is the single most important structural technique for keeping the root file short.**
Three distinct mechanisms exist, and they are *not* equivalent.

### 5.1 Plain markdown links + a trigger condition (portable, works everywhere)

The root file lists pointers with an explicit *when*. The agent reads the target with its normal
file tools only if the condition matches. Nothing extra loads at startup.

The most developed real example is **`openai/openai-agents-python`**, which keeps a
`.agents/references/` directory and a reference map, then writes trigger-conditioned pointers:

> *"For turn accounting, guardrail ordering, handoffs, interruptions, cancellation, hooks, or
> streaming behavior, read [Runner lifecycle](.agents/references/runner-lifecycle.md)."*
>
> *"If the serialized `RunState` shape changes, read [RunState schema and resume boundary]… and
> follow its release-boundary, schema-version, backward-read, and regression-test rules."*
>
> *"Start with [the reference map](.agents/references/README.md) and open only the files relevant to
> the affected runtime boundary."*

— [raw AGENTS.md](https://raw.githubusercontent.com/openai/openai-agents-python/main/AGENTS.md)

Note the shape: **condition first, path second.** `For <situation>, read <path>` is far more
reliable than a bare "see also" list, because the trigger is what the model matches against.

OpenAI endorses the pattern in the abstract: *"keep the main file concise and reference
task-specific markdown files."* — [learn.chatgpt.com/guides/best-practices](https://learn.chatgpt.com/guides/best-practices)

Anthropic endorses it for skills, with an explicit template:

> *"Reference supporting files from `SKILL.md` so Claude knows what each file contains and when to
> load it"* — e.g. `- For complete API details, see [reference.md](reference.md)`. And:
> *"This keeps `SKILL.md` focused on the essentials while letting Claude access detailed reference
> material only when needed. Large reference docs, API specifications, or example collections don't
> need to load into context every time."*

— [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)

### 5.2 `@import` syntax (NOT lazy — this is the trap)

Claude Code, Amp and Gemini CLI all support `@path` mentions inside the instruction file. It is
tempting to treat these as a lazy index. **They are not.**

> *"Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that
> references them."* … *"Splitting into `@path` imports helps organization but doesn't reduce
> context, since imported files load at launch."*
> — [code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)

So `@` is for **composition** (one logical file split across several physical files, e.g. the
`@AGENTS.md` bridge), not for **deferral**. If you want deferral, use a plain markdown link
(§5.1). Amp is the exception that makes deferral work: an `@`-mentioned file carrying `globs:`
frontmatter is only included *once Amp reads a matching file*
([ampcode.com/manual](https://ampcode.com/manual)).

### 5.3 Tool-native path-scoped loading (best fidelity, least portable)

Every major tool has now shipped a mechanism that loads a rule file only when the agent touches
matching paths. These are genuinely lazy, but each is proprietary:

| Tool | Mechanism |
|---|---|
| Claude Code | `.claude/rules/*.md` with `paths:` glob frontmatter; skills with `paths:`; per-directory `CLAUDE.md` loaded lazily |
| GitHub / VS Code | `.github/instructions/*.instructions.md` with `applyTo:` glob |
| Cursor | `.cursor/rules/*.mdc` with `globs:` + `alwaysApply: false` |
| Windsurf / Devin Desktop | a subdirectory `AGENTS.md` is auto-converted into a glob rule of `<directory>/**` |
| Amp | `globs:` frontmatter in an `@`-mentioned file |
| Cline / Roo / Devin CLI | frontmatter globs / `trigger` fields on rule files |
| Codex, Amp, goose, Devin CLI, Claude Code | subtree instruction files loaded lazily when the agent reads a file in that subtree |

**Does the plain-markdown version actually work?** The honest answer from the primary sources is
*"it is the documented and vendor-recommended approach, and it is what the highest-quality real
files do"* — Anthropic, OpenAI and the `openai-agents-python` maintainers all use it. I found **no
vendor-published measurement** of how often an agent actually follows the pointer. Treat the
mechanism as sound-by-consensus, not proven-by-benchmark, and hedge it: put the *rule* in the root
file and the *detail* behind the link, so a missed jump degrades rather than breaks.

---

## 6. What a genuinely portable AGENTS.md looks like

Derived from the constraints above, not invented:

**Layout**

```
repo/
├── AGENTS.md                    # the single source of truth (real file, committed)
├── CLAUDE.md                    # 1 line: @AGENTS.md   (+ optional Claude-only section)
├── .gemini/settings.json        # {"context":{"fileName":["AGENTS.md","GEMINI.md"]}}
├── .aider.conf.yml              # read: AGENTS.md
└── packages/<pkg>/AGENTS.md     # additive only, never contradicting the root
```

Everything else in the matrix reads `AGENTS.md` natively.

**Hard constraints to design against**

1. **Under 12,000 characters** — the tightest documented per-file cap (Windsurf). Under ~200 lines
   is the better target (Anthropic), or "no longer than 2 pages" (GitHub).
2. **Plain CommonMark. No YAML frontmatter, no MDC, no XML tags.** The standard says "just standard
   Markdown"; frontmatter is meaningful to some loaders and literal text to others.
3. **Additive nesting only.** Three incompatible nesting models are in the wild; a subdirectory file
   that contradicts the root will behave differently in each.
4. **Assume it is advisory context, not enforcement.** Anything that must happen every time belongs
   in a hook, a git hook, or CI — not in prose.
5. **Assume no guaranteed ordering against tool-native files.** Cursor and GitHub do not document
   how `AGENTS.md` ranks against `.cursor/rules` and `.github/copilot-instructions.md`
   respectively. Don't build a design that depends on winning that race — keep one source of truth.

**Section skeleton** — the intersection of what agents.md lists, what Anthropic/OpenAI/GitHub/Amp
recommend, and what recurs in real files (see §4):

```markdown
# <Project> — agent instructions

## Overview
One paragraph: what this is, the stack with concrete versions, the top-level layout.

## Setup
Exact commands from clone to running. Required env vars and where they come from.

## Commands
Copy-pasteable build / test / lint. The single command that means "am I done?".
Prefer the narrow command (one package, one test) over the whole-suite one.

## Project structure
Where things live, by directory. Not a file-by-file listing.
Better: a Task | Location | Notes table (see cloudflare/workers-sdk's WHERE TO LOOK).

## Code style
Only what differs from the language's defaults. Delete anything the model already does right.

## Testing
Which runner, where tests live, what a new test must include.

## Boundaries
Always: ...      (hard requirements)
Ask first: ...   (escalation surface)
Never: ...       (generated files, vendored dirs, secrets, files that must not be edited)

## Commits and PRs
Branch naming, commit message format, PR title format, what must pass before opening.

## Further reading
For <condition>, read <path>.   ← condition first, path second

<!-- optional, if you keep one -->
## Learnings
symptom -> fix -> why it matters.  Append-only, but pruned under the hygiene rule below.

## Maintaining this file
High bar for new rules. No drive-by additions. Delete a rule once the agent gets it right
without it. Review this file in PRs like any other doc.
```

The last two sections are the two highest-leverage additions observed in real files
(`openai-cookbook`'s `Recent Learnings` + `zed/.rules`'s `Rules Hygiene`) and they are
complementary: the learnings log is what makes the file accumulate value, the hygiene rule is what
stops it becoming the thing that gets ignored.

**Maintenance loop**, from OpenAI and Anthropic combined: add an entry only when the agent makes the
same mistake twice; review the file in PRs like any other doc; re-read it after major model
releases and delete rules that patched limitations the model no longer has; if a rule is being
ignored, suspect length before suspecting phrasing.

---

## Uncertain / unverified

Flagged honestly rather than papered over.

1. **Which file wins between `AGENTS.md` and a tool's own file, in Cursor and GitHub Copilot.**
   - Cursor frames `AGENTS.md` as "a simple alternative to `.cursor/rules`" and states no ranking
     between them. ([cursor.com/docs/context/rules](https://cursor.com/docs/context/rules))
   - GitHub's ordered precedence list puts agent instructions **below** `.github/copilot-instructions.md`
     ([docs.github.com](https://docs.github.com/en/copilot/concepts/response-customization)) — but the
     tiebreak *within* the repository tier if both files exist is not spelled out.
2. **GitHub Copilot's per-feature support matrix for agent instructions.** The docs say they are
   "currently not supported by all Copilot features" but I could not retrieve the table enumerating
   which. Assume patchy coverage outside the coding agent and VS Code.
3. **OpenAI Codex *cloud* discovery order.** The documented algorithm (global `~/.codex/` → git-root
   → cwd) is written for the CLI. The global scope obviously cannot apply in a fresh cloud
   container, and I found no primary source describing the cloud agent's merge order.
4. **Jules and Zed nesting.** Both document a root-level/first-match file and say nothing about
   subdirectory discovery. This is absence of documentation, not documented absence. Do not rely on
   nested files with either.
5. **Cline's single-file `.clinerules`** (as opposed to the `.clinerules/` directory) and the
   "Cline Rules bank" / `.clinerules-bank` pattern are widely cited in third-party posts but do not
   appear in current [docs.cline.bot](https://docs.cline.bot/customization/cline-rules). Treat as
   legacy/undocumented.
6. **Whether the "read this when X" pointer pattern measurably works.** Vendor-recommended and used
   by the best real files, but I found no published measurement of follow-through rate. See §5.3.
7. **Version/date `AGENTS.md` support landed** for Cursor, Zed, and cloud Devin — not stated on
   their docs pages.
8. **Gemini CLI tie-break when `context.fileName` is an array** and two of the named files exist in
   the same directory. Source shows all are collected and concatenated
   ([memoryDiscovery.ts](https://github.com/google-gemini/gemini-cli/tree/main/packages/core/src/utils));
   no documented winner.
9. **Aider's `--conventions-file` flag** is widely cited online and **does not exist** in the
   [options reference](https://aider.chat/docs/config/options.html). The real mechanisms are
   `--read` / `read:` / `/read`.
10. **Doc URLs that have moved** and will break older citations: `docs.windsurf.com` →
    `docs.devin.ai/desktop`; `docs.roocode.com` → `roocodeinc.github.io/Roo-Code`;
    `jetbrains.com/help/junie` → `junie.jetbrains.com/docs`; `zed.dev/docs/ai/rules` →
    `zed.dev/docs/ai/instructions`; `block.github.io/goose/...using-goosehints` → `goose-docs.ai`;
    `developers.openai.com/codex/*` and `docs.anthropic.com/.../claude-code/*` →
    `learn.chatgpt.com` and `code.claude.com` respectively. Also
    `openai/codex/docs/agents_md.md` is now a pointer stub with no content.
