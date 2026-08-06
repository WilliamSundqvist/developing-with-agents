# Bootstrap prompts: onboarding an agent onto an existing codebase

**Question:** what does a state-of-the-art "read this repo and write its AGENTS.md / CLAUDE.md" prompt actually look like?

**Source discipline.** Every built-in initialiser below is quoted from the shipped artifact — the prompt file in the vendor's repo, or (for Claude Code) the string extracted from the installed binary — not from a blog description of it. Community prompts are quoted from `raw.githubusercontent.com`. Failure-mode claims are attributed and rated. Where a claim rests only on assertion, it says so. §9 collects what could not be verified.

**Date of research:** 2026-08-06.

---

## 0. TL;DR

The built-ins split into three tiers.

| Tier | Tools | Characterisation |
|---|---|---|
| **Template-filler** | Codex CLI, Gemini CLI | Fixed outline, "infer it", no verification, no honesty clause. Produces exactly the "repository overview" content the ETH study found unhelpful. |
| **Negative-space writer** | Claude Code `/init` (legacy), OpenCode `/init`, Copilot `/init` | Defined by what to *exclude*. "Would an agent likely miss this without help? If not, leave it out." |
| **Interviewer / auditor** | Claude Code `/init` (new, phased), community `context-architecture` | Asks the human what code can't answer; or refuses to write a claim that isn't bound to a check that fails when it goes stale. |

The single best-written built-in is **OpenCode's**. The single best artifact in the whole space is the community **`context-architecture`** skill, because it is the only one that treats a generated instruction file as a *liability* until a mechanism guards it.

---

## 1. The built-in initialisers, verbatim

### 1.1 Claude Code — legacy `/init`

Extracted from the installed CLI binary, `~/.local/share/claude/versions/2.1.191` (Claude Code 2.1.191, June 2026). Two prompts ship side by side; the command selects between them (`getPromptForCommand()` returns the new phased prompt or this legacy one, with the command *description* switching on `process.env.CLAUDE_CODE_NEW_INIT`). Verbatim:

> Please analyze this codebase and create a CLAUDE.md file, which will be given to future instances of Claude Code to operate in this repository.
>
> What to add:
> 1. Commands that will be commonly used, such as how to build, lint, and run tests. Include the necessary commands to develop in this codebase, such as how to run a single test.
> 2. High-level code architecture and structure so that future instances can be productive more quickly. Focus on the "big picture" architecture that requires reading multiple files to understand.
>
> Usage notes:
> - If there's already a CLAUDE.md, suggest improvements to it.
> - When you make the initial CLAUDE.md, do not repeat yourself and do not include obvious instructions like "Provide helpful error messages to users", "Write unit tests for all new utilities", "Never include sensitive information (API keys, tokens) in code or commits".
> - Avoid listing every component or file structure that can be easily discovered.
> - Don't include generic development practices.
> - If there are Cursor rules (in .cursor/rules/ or .cursorrules) or Copilot rules (in .github/copilot-instructions.md), make sure to include the important parts.
> - If there is a README.md, make sure to include the important parts.
> - Do not make up information such as "Common Development Tasks", "Tips for Development", "Support and Documentation" unless this is expressly included in other files that you read.
> - Be sure to prefix the file with the following text:
>
> ```
> # CLAUDE.md
>
> This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
> ```

Three things worth stealing:

- **"Focus on the 'big picture' architecture that requires reading multiple files to understand."** This is the sharpest one-line definition of what belongs in an instruction file anywhere in the corpus: content whose *acquisition cost* is high, not content whose *volume* is high.
- **Named anti-examples.** Not "avoid generic advice" but three literal strings the model is known to emit. Naming the failure defeats it far more reliably than describing it.
- **An explicit no-fabrication clause** — and again with named offenders: "Common Development Tasks", "Tips for Development", "Support and Documentation".

The mandated header is also why `/init` lineage is machine-detectable in the wild: grep GitHub for `This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.`

### 1.2 Claude Code — the new phased `/init`

Same binary, second prompt. This is the most elaborate initialiser any vendor ships, and it is structurally different: **it interviews the human before it writes.** Abridged but verbatim in the parts that matter:

> Set up a minimal CLAUDE.md (and optionally skills and hooks) for this repo. CLAUDE.md is loaded into every Claude Code session, so it must be concise — only include what Claude would get wrong without it.
>
> ## Phase 0: Check for an existing CLAUDE.md
>
> Before asking anything, check if CLAUDE.md already exists at the project root (just `cat ./CLAUDE.md` — only the project-root file counts; don't explore the tree yet). This branches Phase 1.
>
> ## Phase 1: Ask what to set up
> […]
> - "I found an existing CLAUDE.md. What would you like to do?"
>   Options: "Review and improve it" | "Leave it, set up other things" | "Start fresh (replace it)"
>
> ## Phase 2: Explore the codebase
>
> Launch a subagent to survey the codebase, and ask it to read key files to understand the project: manifest files (package.json, Cargo.toml, pyproject.toml, go.mod, pom.xml, etc.), README, Makefile/build configs, CI config, existing CLAUDE.md, .claude/rules/, AGENTS.md, .cursor/rules or .cursorrules, .github/copilot-instructions.md, .devin/rules/ or .windsurf/rules/ or .windsurfrules, .clinerules, .mcp.json.
>
> Detect:
> - Build, test, and lint commands (especially non-standard ones)
> - Languages, frameworks, and package manager
> - Project structure (monorepo with workspaces, multi-module, or single project)
> - Code style rules that differ from language defaults
> - Non-obvious gotchas, required env vars, or workflow quirks
> - Existing .claude/skills/ and .claude/rules/ directories
> - Formatter configuration (prettier, biome, ruff, black, gofmt, rustfmt, or a unified format script like `npm run format` / `make fmt`)
> - Git worktree usage: run `git worktree list` […]
>
> **Note what you could NOT figure out from code alone — these become interview questions.**
>
> ## Phase 3: Fill in the gaps
>
> Use AskUserQuestion to gather what you still need to write good CLAUDE.md files and skills. **Ask only things the code can't answer.** […] Skip things already in README or obvious from manifest files. Do not mark any options as "recommended" — this is about how their team works, not best practices.
>
> **Synthesize a proposal from Phase 2 findings and the gap-fill answers.** For each item, pick the artifact type that fits the evidence:
>
>   - **Hook** — deterministic, fast, per-edit shell command (formatting, linting a changed file).
>   - **Skill** — on-demand multi-step workflow (`/verify`, `/deploy-staging`, session reports).
>   - **CLAUDE.md note** — guidance that shapes behavior but isn't enforced (conventions, communication style).
>
> ## Phase 4: Write CLAUDE.md […]
>
> Write a minimal CLAUDE.md at the project root. **Every line must pass this test: "Would removing this cause Claude to make mistakes?" If no, cut it.**
>
> If the user picked "Review and improve it" in Phase 0: don't write fresh — read the existing file, compare against Phase 2 findings and the Phase 3-lite answer, and propose specific additions/removals **as diffs with a one-line reason for each**. The existing file is the baseline; your job is to catch what's missing, outdated, or bloated.
>
> Include:
> - Build/test/lint commands Claude can't guess (non-standard scripts, flags, or sequences)
> - Code style rules that DIFFER from language defaults (e.g., "prefer type over interface")
> - Testing instructions and quirks (e.g., "run single test with: pytest -k 'test_name'")
> - Repo etiquette (branch naming, PR conventions, commit style)
> - Required env vars or setup steps
> - Non-obvious gotchas or architectural decisions
> - Important parts from existing AI coding tool configs if they exist […]
>
> Exclude:
> - File-by-file structure or component lists (Claude can discover these by reading the codebase)
> - Standard language conventions Claude already knows
> - Generic advice ("write clean code", "handle errors")
> - Detailed API docs or long references — use `@path/to/import` syntax instead […]
> - Information that changes frequently — reference the source with `@path/to/import` so Claude always reads the current version
> - Long tutorials or walkthroughs […]
> - Commands obvious from manifest files (e.g., standard "npm test", "cargo test", "pytest")
>
> Be specific: "Use 2-space indentation in TypeScript" is better than "Format code properly."
>
> Do not repeat yourself and do not make up sections like "Common Development Tasks" or "Tips for Development" — only include information expressly found in files you read.

Then Phases 5–8: personal `CLAUDE.local.md` (gitignored, with real worktree handling), skills, hooks (routing "before committing" to a *git* pre-commit hook because tool matchers can't filter Bash by command content), and a closing to-do list.

The four genuinely novel moves here, none of which appear in any other vendor's initialiser:

1. **"Note what you could NOT figure out from code alone — these become interview questions."** The unknowns are a first-class output of exploration, not a silent gap.
2. **Artifact routing.** The same finding becomes a hook, a skill, or a prose note depending on whether it must be *guaranteed*, *invoked*, or merely *suggested*. This directly answers the "instruction files are advisory" problem (§4.3).
3. **Diff-not-rewrite on the update path.** "The existing file is the baseline; your job is to catch what's missing, outdated, or bloated."
4. **Frequently-changing content is imported, not copied** (`@path/to/import`), so a class of staleness is designed out rather than warned about.

The same binary also ships `/init-verifiers` — "Create verifier skill(s) for automated verification of code changes" — which detects app type (web / CLI / API) and scaffolds a Playwright / tmux / HTTP verifier, explicitly *not* unit tests: "**Do NOT create verifiers for unit tests or typechecking.** […] Focus on functional verification." That is bootstrapping the *feedback loop* rather than the *document*, and is arguably higher-leverage than either `/init`.

### 1.3 OpenCode — `/init` (the best-written built-in)

`packages/opencode/src/command/template/initialize.txt` and the identical `packages/core/src/plugin/command/initialize.txt` in [sst/opencode](https://github.com/sst/opencode). Quoted in full-relevant-part:

> Create or update `AGENTS.md` for this repository.
>
> The goal is a compact instruction file that helps future OpenCode sessions avoid mistakes and ramp up quickly. **Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.**
>
> ## How to investigate
>
> Read the highest-value sources first:
> - `README*`, root manifests, workspace config, lockfiles
> - build, test, lint, formatter, typecheck, and codegen config
> - CI workflows and pre-commit / task runner config
> - existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
> - repo-local OpenCode config such as `opencode.json`
>
> If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. **Prefer reading the files that explain how the system is wired together over random leaf files.**
>
> **Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.**
>
> ## What to extract
> […]
> - exact developer commands, especially non-obvious ones
> - how to run a single test, a single package, or a focused verification step
> - required command order when it matters, such as `lint -> typecheck -> test`
> - monorepo or multi-package boundaries, ownership of major directories, and the real app/library entrypoints
> - framework or toolchain quirks: generated code, migrations, codegen, build artifacts, special env loading, dev servers, infra deploy flow
> - repo-specific style or workflow conventions that differ from defaults
> - testing quirks: fixtures, integration test prerequisites, snapshot workflows, required services, flaky or expensive suites
>
> **Good `AGENTS.md` content is usually hard-earned context that took reading multiple files to infer.**
>
> ## Questions
>
> Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.
>
> Good questions:
> - undocumented team conventions
> - branch / PR / release expectations
> - missing setup or test prerequisites that are known but not written down
>
> **Do not ask about anything the repo already makes clear.**
>
> ## Writing rules
> […]
> Exclude:
> - generic software advice
> - long tutorials or exhaustive file trees
> - obvious language conventions
> - **speculative claims or anything you could not verify**
> - content better stored in another file referenced via `opencode.json` `instructions`
>
> **When in doubt, omit.**
>
> Prefer short sections and bullets. If the repo is simple, keep the file simple. […]
>
> If `AGENTS.md` already exists at `${path}`, **improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile it with the current codebase.**

Two lines here are the best in the entire corpus and appear nowhere else:

- **"Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify."** This is an explicit precedence order over evidence classes. The README is *demoted* relative to `package.json`. No other initialiser tells the agent what to do when its sources disagree.
- **"speculative claims or anything you could not verify"** as an exclusion, plus **"When in doubt, omit."** A default that fails toward silence rather than filler.

It is also the only built-in that budgets the interview: "one short batch at most", with a whitelist of question types and an explicit prohibition on asking what the repo already answers.

### 1.4 Codex CLI — `/init`

[`codex-rs/tui/prompt_for_init_command.md`](https://github.com/openai/codex/blob/main/codex-rs/tui/prompt_for_init_command.md), quoted in full:

> Generate a file named AGENTS.md that serves as a contributor guide for this repository.
> Before writing, check whether AGENTS.md already exists in the current working directory. If it does, do not overwrite or modify it.
> Your goal is to produce a clear, concise, and well-structured document with descriptive headings and actionable explanations for each section.
> Follow the outline below, but adapt as needed — add sections if relevant, and omit those that do not apply to this project.
>
> Document Requirements
>
> - Title the document "Repository Guidelines".
> - Use Markdown headings (#, ##, etc.) for structure.
> - **Keep the document concise. 200-400 words is optimal.**
> - Keep explanations short, direct, and specific to this repository.
> - Provide examples where helpful (commands, directory paths, naming patterns).
> - Maintain a professional, instructional tone.
>
> Recommended Sections
>
> Project Structure & Module Organization
> - Outline the project structure, including where the source code, tests, and assets are located.
>
> Build, Test, and Development Commands
> - List key commands for building, testing, and running locally (e.g., npm test, make build).
> - Briefly explain what each command does.
>
> Coding Style & Naming Conventions
> - Specify indentation rules, language-specific style preferences, and naming patterns.
> - Include any formatting or linting tools used.
>
> Testing Guidelines
> - Identify testing frameworks and coverage requirements.
> - State test naming conventions and how to run tests.
>
> Commit & Pull Request Guidelines
> - **Summarize commit message conventions found in the project's Git history.**
> - Outline pull request requirements (descriptions, linked issues, screenshots, etc.).
>
> (Optional) Add other sections if relevant, such as Security & Configuration Tips, Architecture Overview, or Agent-Specific Instructions.

This is the weakest of the built-ins on quality control and the strongest on brevity. It has:

- a hard word budget (**200–400 words**) — the only numeric budget any vendor states in the prompt itself;
- an absolute no-overwrite guard;
- one genuinely good instruction nobody else has: **mine git history for commit-message conventions**;
- **no** exclusion list, **no** no-fabrication clause, **no** verification step, **no** interview. It is a form to fill in, so the model fills it in — which is precisely how you get a "Coding Style & Naming Conventions" section invented for a repo that has no style guide.

Codex's *own* `AGENTS.md` is the counter-example to its own generator: it is hand-written, has none of the five prescribed headings, and consists almost entirely of hard-won repo-specific rules ("Never add or modify any code related to `CODEX_SANDBOX_NETWORK_DISABLED_ENV_VAR`… Any existing code that uses [it] was authored with this fact in mind"). ([openai/codex/AGENTS.md](https://github.com/openai/codex/blob/main/AGENTS.md))

### 1.5 Gemini CLI — `/init`

[`packages/core/src/commands/init.ts`](https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/commands/init.ts), the prompt in full:

> You are an AI agent that brings the power of Gemini directly into the terminal. Your task is to analyze the current directory and generate a comprehensive GEMINI.md file to be used as instructional context for future interactions.
>
> **Analysis Process:**
>
> 1.  **Initial Exploration:**
>     *   Start by listing the files and directories to get a high-level overview of the structure.
>     *   Read the README file (e.g., `README.md`, `README.txt`) if it exists. This is often the best place to start.
>
> 2.  **Iterative Deep Dive (up to 10 files):**
>     *   Based on your initial findings, select a few files that seem most important (e.g., configuration files, main source files, documentation).
>     *   Read them. As you learn more, refine your understanding and decide which files to read next. **You don't need to decide all 10 files at once. Let your discoveries guide your exploration.**
>
> 3.  **Identify Project Type:**
>     *   **Code Project:** Look for clues like `package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Cargo.toml`, `build.gradle`, or a `src` directory. […]
>     *   **Non-Code Project:** If you don't find code-related files, this might be a directory for documentation, research papers, notes, or something else.
>
> **GEMINI.md Content Generation:**
>
> **For a Code Project:**
>
> *   **Project Overview:** Write a clear and concise summary of the project's purpose, main technologies, and architecture.
> *   **Building and Running:** Document the key commands for building, running, and testing the project. Infer these from the files you've read (e.g., `scripts` in `package.json`, `Makefile`, etc.). **If you can't find explicit commands, provide a placeholder with a TODO.**
> *   **Development Conventions:** Describe any coding styles, testing practices, or contribution guidelines you can infer from the codebase.
>
> […]
>
> **Final Output:**
>
> Write the complete content to the `GEMINI.md` file. The output must be well-formatted Markdown.

Guard clause, verbatim: `'A GEMINI.md file already exists in this directory. No changes were made.'`

Two ideas worth keeping, one anti-pattern:

- **Keep:** the *bounded, adaptive* exploration budget — "up to 10 files… let your discoveries guide your exploration". A cap that is spent adaptively, not planned up front.
- **Keep:** **"If you can't find explicit commands, provide a placeholder with a TODO."** This is the only vendor prompt with an explicit *I-don't-know* escape hatch, and it is the seed of the "write down what could not be determined" technique (§5.4). It is applied to exactly one field, which is a missed opportunity.
- **Anti-pattern:** the word "comprehensive", and "Project Overview: … purpose, main technologies, and architecture" as a mandatory section. This asks for exactly the repository-overview content that the ETH measurement (§4.1) found does not help.

### 1.6 GitHub Copilot / VS Code — `/init` and `/create-instructions`

VS Code's Copilot Chat ships its prompts as plain markdown assets in [microsoft/vscode-copilot-chat](https://github.com/microsoft/vscode-copilot-chat). `assets/prompts/init.prompt.md`, in full:

> ---
> name: init
> description: Generate or update workspace instructions file for AI coding agents
> argument-hint: Optionally specify a focus area or pattern to document for agents
> agent: agent
> ---
> Related skill: `agent-customization`. Load and follow **workspace-instructions.md** for template, principles, and anti-patterns.
>
> Bootstrap workspace instructions (`.github/copilot-instructions.md` or `AGENTS.md` if already present).
>
> ## Workflow
>
> 1. **Discover existing conventions**
>    Search: `**/{.github/copilot-instructions.md,AGENT.md,AGENTS.md,CLAUDE.md,.cursorrules,.windsurfrules,.clinerules,.cursor/rules/**,.windsurf/rules/**,.clinerules/**,README.md}`
>
> 2. **Explore the codebase** via subagent, 1-3 in parallel if needed
>    Find essential knowledge that helps an AI agent be immediately productive:
>    - Build/test commands (agents run these automatically)
>    - Architecture decisions and component boundaries
>    - Project-specific conventions that differ from common practices
>    - Potential pitfalls or common development environment issues
>    - Key files/directories that exemplify patterns
>
>    Also **inventory existing documentation** (`docs/**/*.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, etc.) **to identify topics that should be linked, not duplicated.**
>
> 3. **Generate or merge**
>    - New file: Use template from workspace-instructions.md, include only relevant sections
>    - Existing file: Preserve valuable content, update outdated sections, remove duplication
>    - Follow the **Link, don't embed** principle from workspace-instructions.md
>
> 4. **Iterate**
>    - Ask for feedback on unclear or incomplete sections
>    - If the workspace is complex, suggest applyTo-based instructions for specific areas (e.g., frontend, backend, tests)
>
> Once finalized, suggest example prompts to see it in action, and propose related agent-customizations to create next […]

The referenced `assets/prompts/skills/agent-customization/references/workspace-instructions.md` carries the standards, verbatim:

> ## Core Principles
>
> 1. **Minimal by default**: Only what's relevant to *every* task
> 2. **Concise and actionable**: Every line should guide behavior
> 3. **Link, don't embed**: Reference docs instead of copying content. Search for existing docs (`docs/**/*.md`, `CONTRIBUTING.md`, etc.) and catalog what they cover—only inline agent-critical gotchas not documented elsewhere
> 4. **Keep current**: Update when practices change
>
> ## Anti-patterns
>
> - **Using both file types**: Having both `copilot-instructions.md` and `AGENTS.md`
> - **Kitchen sink**: Everything instead of what matters most
> - **Duplicating docs**: Copying README instead of linking
> - **Obvious instructions**: Conventions already enforced by linters

Distinctive contributions:

- **The discovery glob is the most complete inventory of rival agent-doc formats published anywhere.** Worth lifting verbatim.
- **"Inventory existing documentation … to identify topics that should be linked, not duplicated."** Explicitly makes *cataloguing what the repo already documents* a step, so the generated file is a router rather than a copy.
- **"Obvious instructions: Conventions already enforced by linters."** The one anti-pattern statement that names the correct test for redundancy — if a mechanism already enforces it, prose about it is dead weight.
- **Explicit merge semantics** on the existing-file path: preserve / update / de-duplicate.

`assets/prompts/create-instructions.prompt.md` adds the complementary, under-appreciated move — **mine the session, not the repo**:

> ## Extract from Conversation
> First, review the conversation history. If the user has been correcting the agent's output or asking for specific patterns (e.g., "always use X", "never do Y", "follow this style"), generalize that into a persistent instruction. Extract:
> - Corrections or preferences mentioned during the conversation
> - Coding patterns the user enforced or requested
> - Project-specific conventions referenced
>
> ## Iterate
> 1. Draft the instruction and save it.
> 2. **Identify the most ambiguous or weak parts and ask about those.**
> 3. Once finalized, summarize what the instruction enforces […]

"Draft, then identify the weakest parts and ask about those" is a self-critique loop, and it is cheap. Nobody else does it.

### 1.7 Cursor

Cursor is closed-source; **no generation prompt is publicly obtainable**, and I could not recover one from the installed application bundle (the strings present are UI labels and the rules-loading service, not a generator prompt).

What the docs state ([cursor.com/docs/context/rules](https://cursor.com/docs/context/rules)):

- Creation is via **`/create-rule`** in Agent: "Type `/create-rule` in Agent and describe what you want. Agent generates the rule file with proper frontmatter and saves it to `.cursor/rules`." The older `/Generate Cursor Rules` command (Cursor 0.49) is no longer documented.
- Four application modes: "Apply to every chat session" / "When Agent decides it's relevant based on description" / "When file matches a specified pattern" / "When @-mentioned in chat".
- **"Keep rules under 500 lines"**, split larger ones into composable rules.
- A real silent-failure trap, from the docs: "A plain `.md` file in `.cursor/rules` is ignored by the rules system because it has no frontmatter to specify `description`, `globs`, and `alwaysApply`."
- Guidance against "Copying entire style guides", "Documenting every possible command", "Adding instructions for edge cases that rarely apply".

The interesting design point is that Cursor's answer to bloat is not brevity but **scoping**: rules are attached by glob or by agent judgement rather than always-loaded.

### 1.8 Amazon Kiro — steering docs

Kiro is closed-source; only the doc-level behaviour is public ([kiro.dev/docs/steering](https://kiro.dev/docs/steering/)). Its "Generate Steering Docs" button produces three files in `.kiro/steering/`:

> **Product Overview** (`product.md`) - Defines your product's purpose, target users, key features, and business objectives. This helps Kiro understand the "why" behind technical decisions […]
>
> **Technology Stack** (`tech.md`) - Documents your chosen frameworks, libraries, development tools, and technical constraints. […]
>
> **Project Structure** (`structure.md`) - Outlines file organization, naming conventions, import patterns, and architectural decisions. […]
>
> These foundation files are included in every interaction by default […]

The structural idea worth taking is **splitting by rate of change and by audience**: product intent (changes rarely, human-sourced), stack (changes with dependencies, machine-derivable), structure (changes with refactors). Same total content, three independently-refreshable files, plus per-file `inclusion: always | fileMatch | manual | auto` frontmatter. Kiro also honours `AGENTS.md`, with the caveat that those "do not support inclusion modes and are always included."

### 1.9 Side-by-side

| | Claude legacy | Claude new | OpenCode | Codex | Gemini | Copilot |
|---|---|---|---|---|---|---|
| Existing-file behaviour | suggest improvements | ask; diff-with-reasons | improve in place, delete stale | **refuse** | **refuse** | merge/de-dupe |
| Explicit exclusion list | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (anti-patterns) |
| No-fabrication clause | ✅ (named) | ✅ (named) | ✅ ("could not verify") | ❌ | ❌ | ❌ |
| "I don't know" output | ❌ | ✅ (→ interview) | ❌ | ❌ | ✅ (TODO placeholder) | ❌ |
| Interviews the human | ❌ | ✅ (structured) | ✅ (1 batch max) | ❌ | ❌ | ✅ (feedback) |
| Scans rival agent-doc formats | ✅ | ✅ (10 formats) | ✅ | ❌ | ❌ | ✅ (widest glob) |
| Exploration budget | — | subagent | "small number" of code files | — | **10 files** | 1–3 subagents |
| Length budget | — | line-by-line test | line-by-line test | **200–400 words** | "comprehensive" | "minimal by default" |
| Runs build/tests to verify | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Grounds claims in file paths | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Emits a staleness mechanism | ❌ | partial (`@import`) | ❌ | ❌ | ❌ | ❌ |

**No shipped initialiser executes a single command it writes down.** That is the largest gap in the state of the art.

### 1.10 What the output actually looks like in the wild

- **[browser-use/browser-use/CLAUDE.md](https://github.com/browser-use/browser-use/blob/main/CLAUDE.md)** — 163 lines, carries the `/init` header verbatim, but has clearly been hand-grown since. It is the good case, and the reason is visible in one formatting decision: **every architectural claim carries a file path.** "**Agent (`browser_use/agent/service.py`)**: The main orchestrator…", "**BrowserSession (`browser_use/browser/session.py`)**…", "All CDP client management lives in `browser_use/browser/session.py`." That makes each claim checkable, and puts the reader one hop from the source instead of trusting the summary. Its commands section is likewise exact and non-guessable (`uv run pytest -vxs tests/ci`, `uv run pyright`).
- **[lobehub/lobe-chat/CLAUDE.md](https://github.com/lobehub/lobe-chat/blob/main/CLAUDE.md)** — one line: `@AGENTS.md`. **[openai/openai-agents-python/CLAUDE.md](https://github.com/openai/openai-agents-python/blob/main/CLAUDE.md)** — the literal text `AGENTS.md`. Mature repos converge on *one* file plus pointers, defeating multi-file drift by construction.
- **[openai/codex/AGENTS.md](https://github.com/openai/codex/blob/main/AGENTS.md)** — the anti-template: no "Repository Guidelines" heading, no project overview, just dozens of specific rules with the reason attached ("Integration tests that want to run Seatbelt themselves cannot be run under Seatbelt, so checks for `CODEX_SANDBOX=seatbelt` are also often used to early exit out of tests"). None of it is derivable from reading the repo cold. This is the target the generators are aiming at and mostly missing.

GitHub's own survey of 2,500+ repos lands in the same place: "**One real code snippet showing your style beats three paragraphs describing it**", "Set clear boundaries: Tell AI what it should never touch", and "**The best agent files grow through iteration, not upfront planning**" ([github.blog](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)).

---

## 2. Community-built, better versions

### 2.1 `context-architecture` — the best artifact in this space

A skill by Sergio Azócar (CC BY 4.0), canonical spec at [context-architecture.dev](https://context-architecture.dev), distributed via [davila7/claude-code-templates](https://github.com/davila7/claude-code-templates/blob/main/cli-tool/components/skills/development/context-architecture/SKILL.md) (348 lines). It reframes the whole task: not "write a document", but "audit the repo and bind its claims".

> ## The one assumption
>
> Design for a reader who **retains nothing between sessions and knows only what the repository says out loud.** An AI agent meets this exactly; a new human contributor approximates it.
>
> ## The rule (the test you run, claim by claim)
>
> > Every claim a repository makes about itself must be bound to a mechanism that fails when that claim stops being true.
>
> […] For each one, ask: **is there a compiler, a linter rule, an automated test, or a review step (by a person or an agent) that breaks when that stops being true?** If not, it is prose, and prose goes stale without anything noticing. **A claim with no mechanism behind it _is_ the violation.**
>
> The mechanism has to actually fail, not just exist. A performance test that never exercises the slow path does not satisfy the rule, it violates it.

Its diagnostic list is the sharpest inventory of *why* you want the file at all — five things a cold agent does when a claim is unbound:

> - **Reimplementation.** The source of truth was not locatable, so the reader rebuilt what existed.
> - **Invented structure.** None was imposed, so the reader imposed its own.
> - **Obedience to false documentation.** Cites deleted files or contradicts the current code.
> - **Deprecated-pattern propagation.** Copies the most visible pattern even when it is obsolete.
> - **Random ambiguity resolution.** Two conventions coexist; it uses whichever it read first.

Its procedure is four phases, **read-only until the plan exists**:

> Run four phases in order. Phases 1 and 2 are read-only; do not edit until you have the audit and a prioritized plan. The work in phase 3 is **incremental**: one bounded change at a time, each landing with the mechanism that keeps it true.
>
> ### Phase 2: Prioritize (incremental, by leverage)
>
> Never propose a big-bang restructuring. Order the work by leverage and reversibility:
>
> 1. **Context-rot first** (cheap, high trust). Find and fix docs that lie; they actively mislead the reader.
> 2. **Embedded context at the top boundaries** (`AGENTS.md` at the root and the few highest-traffic directories). Highest legibility gain per edit.
> 3. **Codify the loudest conventions** (turn the most-repeated review comment into a lint rule or a type).
> 4. **Name the worst junk drawers** […]
> 5. **Domain-first top level** last, and only if the gain justifies the churn. […]
>
> Output a backlog: each item is one PR-sized change, with the mechanism it lands with.

Its `AGENTS.md` template is the only one in the corpus organised by *epistemic status* rather than by topic:

> ```markdown
> # AGENTS.md (<boundary name>)
>
> <One line: what this boundary owns.>
>
> ## Source of truth
> <Where the authoritative data/config/logic for this boundary lives.>
>
> ## Invariants
> <Rules that must hold. Each should be bound to a mechanism; note which.>
>
> ## Gotchas / accepted tech debt
> <What looks wrong but is intentional, and why.>
>
> ## The why a spec left behind
> <Rationale the code cannot hold, moved here from a removed spec (principle 06).>
> ```
>
> Bind each invariant to a mechanism, and **add the mechanism in the same change**, or the AGENTS.md is a new claim that can go stale.

And the anti-staleness pass, which is the piece every vendor initialiser is missing:

> **Detect and fix context-rot.** Find documentation that lies:
>
> - Extract every file path, command, symbol, and URL referenced in `README`, `AGENTS.md`/`CLAUDE.md`, and design docs; verify each still exists / still runs. **Dead references are the highest-priority fix.**
> - Diff each `AGENTS.md` against the code it sits beside: does it describe modules, exports, or flows that no longer match? Correct the doc, then **add the test that would have caught it**.
> - Land a **doc-reference test** so this class of rot cannot return.

Guardrails, verbatim:

> - **A claim without a mechanism is the violation.** Do not add an `AGENTS.md` invariant, a README promise, or a convention doc without the check that fails when it stops being true.
> - **The mechanism must actually fail.** A test that never exercises the path it guards violates the rule, it does not satisfy it.
> - **Respect the limits.** If the repo is a throwaway or the problem is ill-defined, say the cost beats the return rather than applying the discipline anyway.
> - **It does not make the agent smarter.** It makes the truth of the repository checkable automatically […]

It also produces an **audit report before any edit** — per-principle verdict table with evidence paths, observed failure-mode signals, context-rot found, and a prioritised backlog. That report, not the `AGENTS.md`, is the primary deliverable.

*Caveat:* this is one author's methodology, self-described and not independently evaluated. Its value here is the design ideas, not proof they work.

### 2.2 GitHub spec-kit — `/constitution`

[templates/commands/constitution.md](https://github.com/github/spec-kit/blob/main/templates/commands/constitution.md). Not a repo-reader — it fills a governance template — but three mechanics transfer directly:

> ## Scope Guard
>
> This command's own work is limited to updating the project constitution itself. […]
> - If the input includes feature implementation, code generation, refactoring, building, or deployment requests, you **MUST NOT** execute them. Extract them as deferred intents instead.

> 2. Collect/derive values for placeholders:
>    - If user input (conversation) supplies a value, use it.
>    - Otherwise infer from existing repo context (README, docs, prior constitution versions if embedded).
>    - For governance dates: `RATIFICATION_DATE` is the original adoption date (**if unknown ask or mark TODO**) […]
>    - `CONSTITUTION_VERSION` must increment according to semantic versioning rules: MAJOR […] MINOR […] PATCH […]

> 4. Produce a **Sync Impact Report** (prepend as an HTML comment at top of the constitution file after update):
>    - Version change: old → new
>    - List of modified principles (old title → new title if renamed)
>    - Added sections / Removed sections
>    - **Follow-up TODOs if any placeholders intentionally deferred.**
>
> 5. Validation before final output:
>    - **No remaining unexplained bracket tokens.**
>    - Dates ISO format YYYY-MM-DD.
>    - Principles are declarative, testable, and free of vague language ("should" → replace with MUST/SHOULD rationale where appropriate).

Transferable: **an explicit source precedence (human > repo > TODO)**; **a versioned, diffable changelog embedded in the artifact**; **a machine-checkable completion criterion** ("no remaining unexplained bracket tokens") — i.e. the unfilled slot is a *detectable* failure rather than a silently-invented sentence; and **a scope guard** so the bootstrap session cannot drift into building things.

(spec-kit's `/analyze` is a read-only cross-artifact consistency checker — "**STRICTLY READ-ONLY**: Do **not** modify any files" — not a bootstrapper. Don't cite it as one.)

### 2.3 `awattar/claude-code-best-practices` — `/custom-init`

[.claude/commands/custom-init.md](https://github.com/awattar/claude-code-best-practices/blob/main/.claude/commands/custom-init.md), 207 lines. Explicit about why it exists:

> Claude Code ships with a built-in `/init` command that also generates a `CLAUDE.md`. `/custom-init` covers the same goal through the explicit, deterministic phased workflow below, which produces a more structured result: staged analysis, per-feature detection, a versioned technology stack inventory, and consistent section ordering.

It fans out to six named specialist subagents (solution-architect for architecture, backend-developer for auth / domain / data-access, devops for infra and deployment, qa for testing, technical-writer for assembly), each in its own context window, then assembles. On the existing-file path: "If the file exists, back it up as `CLAUDE.md.backup` and reuse any still-accurate content."

Its closing advice is the honest bit:

> - Keep CLAUDE.md accurate — **stale context is worse than no context.** Re-run `/custom-init` or hand-edit when the architecture or tooling changes.
> - Reference shared templates with the `@` prefix (e.g. `@.gitmessage`) instead of duplicating their content.
> - Be concise: document what is non-obvious, not what Claude can already read from the code.

Worth noting the tension: fan-out to six domain specialists is exactly the machine for producing a *comprehensive* document, which is the thing the evidence says not to produce. The structure is good; the target may be wrong.

### 2.4 The "context prime" lineage — the minimal counter-position

The most-copied community pattern doesn't write a file at all. It re-derives context per session. From [disler/just-prompt/.claude/commands/context_prime.md](https://github.com/disler/just-prompt/blob/main/.claude/commands/context_prime.md), the entire command:

> READ README.md, THEN run git ls-files to understand the context of the project.

And [disler/claude-code-hooks-mastery/.claude/commands/prime.md](https://github.com/disler/claude-code-hooks-mastery/blob/main/.claude/commands/prime.md) in full:

> ---
> allowed-tools: Bash, Read
> description: Load context for a new agent session by analyzing codebase structure, documentation and README
> ---
>
> # Prime
>
> Run the commands under the `Execute` section to gather information about the project, and then review the files listed under `Read` to understand the project's purpose and functionality then `Report` your findings.
>
> ## Execute
> - `git ls-files`
>
> ## Read
> - README.md
> - ai_docs/cc_hooks_docs.md
> […]
>
> ## Report
> - Provide a summary of your understanding of the project

This is a real argument, not laziness: a curated *reading list* cannot go stale the way a *summary* can. If your bootstrap output is a pointer set, drift only breaks when files move — and that is exactly the failure a doc-reference test catches. Worth considering as an output format: a small `AGENTS.md` that is mostly `@`-imports plus a handful of gotchas.

### 2.5 `wshobson/commands` — `/tools:onboard`

[tools/onboard.md](https://github.com/wshobson/commands/blob/main/tools/onboard.md), in full:

> "AI models are geniuses who start from scratch on every task." - Noam Brown
>
> Your job is to "onboard" yourself to the current task.
>
> Do this by:
> - Using ultrathink
> - Exploring the codebase
> - Making use of any MCP tools at your disposal for planning and research
> - **Asking me questions if needed**
> - Using subagents for dividing work and seperation of concerns
>
> The goal is to get you fully prepared to start working on the task. Take as long as you need to get yourself ready. Overdoing it is better than underdoing it.
>
> Record everything in a `.claude/tasks/[TASK_ID]/onboarding.md` file. **This file will be used to onboard you to the task in a new session if needed, so make sure it's comprehensive.**

Different target: *task*-scoped onboarding, written for resumption, deliberately disposable. "Overdoing it is better than underdoing it" is the right default when the artifact is per-task and thrown away, and the wrong default for a file loaded into every future session. The distinction — **durable always-loaded file vs. disposable task-scoped brief** — is one the vendor initialisers do not make and probably should.

### 2.6 `okuvshynov/cubestat` — `/initref`

[.claude/commands/initref.md](https://github.com/okuvshynov/cubestat/blob/main/.claude/commands/initref.md), in full:

> Build a reference for the implementation details of this project. Use provided summarize tool to get summary of the files. Avoid reading the content of many files yourself, as we might hit usage limits. Do read the content of important files though. Use the returned summaries to create reference files in /ref directory. Use markdown format for writing the documentation files.
>
> Update CLAUDE.md file with the pointers to important documentation files.

Tiny, but it is the two-tier output pattern in four lines: **deep detail into separate reference files; the always-loaded file gets only pointers.** Same shape as Copilot's "link, don't embed", Kiro's split steering files, and Claude's `@import`.

### 2.7 Linters — the missing other half

Generation without a freshness mechanism is half a system. Existing tools: [`agents-lint`](https://github.com/giacomo/agents-lint) ("Detect stale paths, dead npm scripts, outdated framework patterns, and context rot"), [`cclint`](https://github.com/felixgeelhaar/cclint), [`Taiizor/agents-md-cookbook`](https://github.com/Taiizor/agents-md-cookbook) (rule-based: `freshness`, `executable-command`, `recommended-sections`, `vague-platitudes`, `naked-donts`, `line-budget`, `inline-secret`). GitLab's knowledge-graph repo runs a CI job diffing `AGENTS.md` against `CLAUDE.md` to keep them in sync ([MR !178](https://gitlab.com/gitlab-org/orbit/knowledge-graph/-/merge_requests/178)).

These vendors are self-interested — treat their existence as evidence the problem is widely felt, not as a measurement of its size. But `vague-platitudes` and `naked-donts` as *lintable categories* is a good idea: a bootstrap prompt could run its own output through those tests before saving.

---

## 3. Anthropic's own position

Worth quoting because the vendor concedes most of the critique in §4.

From [Claude Code best practices](https://code.claude.com/docs/en/best-practices):

> Keep it concise. For each line, ask: *"Would removing this cause Claude to make mistakes?"* If not, cut it. **Bloated CLAUDE.md files cause Claude to ignore your actual instructions!**

> **The over-specified CLAUDE.md.** If your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in the noise. **Fix**: Ruthlessly prune. If Claude already does something correctly without the instruction, delete it or convert it to a hook.

> Treat CLAUDE.md like code: review it when things go wrong, prune it regularly, and **test changes by observing whether Claude's behavior actually shifts.**

> Run `/init` to generate a starter CLAUDE.md file based on your current project structure, **then refine over time**.

Its exclude column reads as a list of what `/init` tends to emit: "Anything Claude can figure out by reading code / Standard language conventions Claude already knows / Detailed API documentation (link to docs instead) / Information that changes frequently / Long explanations or tutorials / File-by-file descriptions of the codebase / Self-evident practices like 'write clean code'".

From [the memory docs](https://code.claude.com/docs/en/memory):

> Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead.

> **Size**: target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence.

> **Consistency**: if two rules contradict each other, Claude may pick one arbitrarily.

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but **there's no guarantee of strict compliance**, especially for vague or conflicting instructions.

> The `/doctor` checkup proposes trims for a checked-in CLAUDE.md: it **cuts content Claude can derive from the codebase, such as directory layouts, dependency lists, and architecture overviews**, and keeps pitfalls, rationale, and conventions that differ from tool defaults.

That last one is the tell: **Anthropic ships a second tool whose job is to delete the kind of content its first tool generates.** Any good bootstrap prompt should apply the `/doctor` test at write time rather than leaving it for a later cleanup.

And from [Using CLAUDE.md files](https://claude.com/blog/using-claude-md-files): additions should solve "real problems you have encountered, not theoretical concerns"; the `#` shortcut exists to "add instructions you find yourself repeating—these additions accumulate into a CLAUDE.md that genuinely reflects how your team works." That accretion model is the direct competitor to one-shot generation, and it is the vendor's own recommendation.

---

## 4. Documented failure modes

### 4.1 The generated content is measurably not useful — STRONG

Gloaguen, Mündler, Müller, Raychev, Vechev (ETH Zurich SRI Lab), **"Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"** — [arXiv:2602.11988](https://arxiv.org/abs/2602.11988), submitted 12 Feb 2026, revised 23 Jun 2026. Verified: title, authors and abstract fetched directly from arXiv.

> "Surprisingly, we find that providing context files does not generally improve task success rates, while increasing inference cost by over 20% on average. This observation holds across different LLMs, coding agents, and for both LLM-generated and developer-committed context files. Specifically, we find that while **instructions in the context files are well followed by coding agents, repository overviews, although popular and recommended by model providers, are not helpful.** We conclude that while context files are useful for specifying non-standard coding practices, any attempts to improve performance should be rigorously evaluated before deployment."

This is the load-bearing citation, and its shape matters more than its headline: it separates the two halves. **Instructions work. Overviews don't.** Every initialiser in §1 devotes most of its output budget to overviews.

Practitioner restatement, Guillaume Moigneu (Upsun): "LLM-generated context files mostly repeat what's already in the repository"; "A five-line context file that addresses your project's specific quirks will outperform a 2,000-word generated overview that restates your README"; "Context files generated by `/init` commands are doing little more than pre-caching information the agent would discover on its own." ([developer.upsun.com](https://developer.upsun.com/posts/ai/agents-md-less-is-more))

**Counterweight, and it matters:** Shepard & Albrecht, "Probe-and-Refine Tuning of Repository Guidance for Coding Agents" ([arXiv:2606.20512](https://arxiv.org/abs/2606.20512), Jun 2026) reports SWE-bench Verified with Qwen 3.5-35B at 33.0% with iteratively refined guidance vs 28.3% static vs 25.5% none. If that holds, the problem is not *generation* but *one-shot* generation. **Unverified** — I did not independently check this paper's abstract.

### 4.2 Instruction files are advisory, and adherence is poor — STRONG

Panavas et al. (Surge AI), **"HANDBOOK.md: A Benchmark for Long-Context Agentic Instruction Following"** ([arXiv:2607.25398](https://arxiv.org/html/2607.25398v1), Jul 2026): 65 agentic tasks, expert-written 20–124-page handbooks, 824 deterministic programmatic criteria, 30 model configurations. Best strict pass rate **36.2%**; most frontier configurations under 25%. Four recurring patterns: policy override by a plausible in-environment instruction; verification executed then ignored; verification skipped and assumed; **false compliance reports**. Conclusion: a "standing document does not function for current models as a persistent authority."

Corroborated by the vendor's own docs (§3): delivered as a user message, "no guarantee of strict compliance", "use a PreToolUse hook instead".

**Practical consequence for a bootstrap prompt:** anything that *must* happen should be emitted as a hook, a pre-commit hook, a CI gate, or a lint rule — not as a bullet. Claude Code's new `/init` is the only initialiser that does this routing.

### 4.3 Bloat crowds out the real instructions — MODERATE, and contested

Anthropic states it plainly ("Bloated CLAUDE.md files cause Claude to ignore your actual instructions!", "target under 200 lines"). Practitioners agree loudly: Alexander Opalic, "Half your context budget is gone before any work begins", "I've seen files balloon to 2000 lines" ([alexop.dev](https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/)).

**But there is a dissenting measurement.** Damon McMillan, "Instruction Adherence in Coding Agent Configuration Files: A Factorial Study of Four File-Structure Variables" ([arXiv:2605.10039](https://arxiv.org/pdf/2605.10039), May 2026) — 1,650 Claude Code sessions, two TypeScript codebases, testing file size, instruction position, file architecture, and conflicting instructions: "None of the four structural variables or three two-way interactions produces a detectable contrast after multiple-testing correction", with Bayes factors 0.05–0.10 for size and conflicts (positive evidence of *no* effect). The one signal was ~5.6% compliance decay per additional function generated *within a session* — adherence degrading with session length, not file length.

That is a solo-author preprint and I have not verified it; treat as suggestive. But it means "keep it under 200 lines" should be stated as vendor guidance, not as an established finding. Note also that the ETH result and the bloat theory are different claims: ETH says overview content doesn't help even when short.

### 4.4 Stale references actively mislead — WIDELY REPORTED, POORLY MEASURED

The clearest statement of why *generated* files rot fastest, HN user `simonkagedal` ([item 45713267](https://news.ycombinator.com/item?id=45713267)):

> "Those often seem to generate a snapshot of the current state of the codebase that to me seem to be just begging to get out of date, often with references to specific files"

`agents-lint`'s README: "AGENTS.md files rot. You write them once, then the codebase evolves — directories move, scripts rename, dependencies change — and the file silently misleads your AI coding agents."

A widely-circulated audit claim — "10-84% of symbol references in AI config files are stale" (HN `ravikirany22`, [item 47531882](https://news.ycombinator.com/item?id=47531882)) — is self-reported by someone building in the space, with a suspiciously wide range. **Do not cite as a measurement.**

Note the irony in §1.10: browser-use's CLAUDE.md is *good* precisely because it names file paths — and naming file paths is exactly what makes it rot-prone. The resolution is not "stop naming paths" but "name paths *and* land a test that they still exist" (§2.1).

### 4.5 `/init` output specifically: filler and self-evident content — PRACTITIONER CONSENSUS

The sharpest version, HN `fl0ki` ([item 49057103](https://news.ycombinator.com/item?id=49057103)):

> "Most people generate CLAUDE.md with /init at first, so it gets filled only with the superficial top level things that Claude already noticed during that first run. By this logic, **shouldn't CLAUDE.md contain the exact opposite of what /init currently includes?**"

Also: "bloated CLAUDE.md files filled with data that agents can gather on the spot very quickly are counter-productive" (`criley2`, [47900417](https://news.ycombinator.com/item?id=47900417)); "I put a lot of time into crafting that file by hand for each project because it's not something it will generate well on its own with /init" (`joshmlewis`, [45688243](https://news.ycombinator.com/item?id=45688243)).

These are forum comments, not studies. Their value is that they converge on the same diagnosis as the ETH paper from the opposite direction.

### 4.6 Nobody maintains it, and fear of bloat causes the abandonment

Steve Klabnik ([HN 45531036](https://news.ycombinator.com/item?id=45531036)):

> "Yeah previously it had # to make that easy. But I also worry about CLAUDE.md bloat and so don't tend to continually update it."

And `koakuma-chan` ([45531026](https://news.ycombinator.com/item?id=45531026)): "The problem though is that it gets bloated and hard-to-read pretty quickly, and I forget what exactly I put in there."

This is the doc-nobody-maintains failure mode with its cause identified: the update habit dies because each addition feels like it degrades the file. A bootstrap prompt that emits a *pruning* mechanism alongside the file addresses this; one that emits only content makes it worse.

### 4.7 Hallucinated rationale is the most dangerous output — STRONG (see §7)

Equal Experts, on a real retroactive-ADR engagement:

> "The AI tools frequently hallucinated reference material, including non-existent APIs, web pages, or entire product features."
>
> "The suggested justifications didn't fit the real decision context, often due to vague prompts or the model ignoring instructions."
>
> "**The clear, logical, and convincing LLM output sounds so credible that it discourages proper scrutiny.**"

([equalexperts.com](https://www.equalexperts.com/blog/our-thinking/accelerating-architectural-decision-records-adrs-with-generative-ai/))

That last line is the deepest failure mode in the whole document, and it applies to bootstrap output generally: a fluent, well-structured `AGENTS.md` is *harder* to review than a rough one, so errors survive the review that was supposed to catch them.

---

## 5. Techniques that raise quality

Each with its evidence and its current adoption.

### 5.1 Run the commands before writing them down

**Nobody ships this.** Every initialiser in §1 *infers* build/test commands from manifests and writes them down unexecuted. The obvious upgrade: before writing `npm test`, run it; record the exit code, the actual runtime, and the first failure if any. If it fails on a clean checkout, that is itself the single most valuable line in the file ("`npm test` fails without `DATABASE_URL`; set it from `.env.example` first").

Support for the general principle is strong even though nobody applies it here: Anthropic's "Give Claude a check it can run… It's the difference between a session you watch and one you walk away from", and "Have Claude show evidence rather than asserting success" ([best practices](https://code.claude.com/docs/en/best-practices)). agents.md's own framing is that the agent "will attempt to execute relevant programmatic checks" — so a command that doesn't work is worse than no command at all. Claude Code's `/init-verifiers` is the nearest shipped relative, and it builds the check rather than running the documented one.

### 5.2 Interview the human instead of guessing

Adopted by Claude Code's new `/init` (structured `AskUserQuestion`, only about what code can't answer), OpenCode (one batch max, question whitelist), and Copilot (post-draft feedback on the weakest parts).

The strongest formulation is Claude's: **"Note what you could NOT figure out from code alone — these become interview questions."** Exploration outputs a *question list* as well as findings. OpenCode's constraint is the necessary complement: "Do not ask about anything the repo already makes clear" — otherwise the interview becomes a quiz the human resents.

Corroborating evidence from an adjacent domain: Equal Experts' retro-ADR engagement gathered rationale "through conversations with stakeholders", using code and VCS only to corroborate *when* a library was introduced and *by whom*. Humans were the source; the repo was the evidence.

### 5.3 Ground every claim in a file path

**Nobody instructs this.** But the best real-world outputs do it (browser-use, §1.10), and it buys three things at once: the claim is checkable by a reader, it is checkable by a doc-reference test, and it gives the agent a jump target instead of a summary it must trust.

The rule to state: *every non-obvious factual claim carries the path (and ideally the symbol) that grounds it; a claim you cannot ground does not get written.* This converts "avoid hallucination" from an exhortation into a formatting constraint, which is far more enforceable.

### 5.4 Write down what could **not** be determined

Only Gemini has a shipped version, and only for one field: "If you can't find explicit commands, provide a placeholder with a TODO." spec-kit generalises it — "if unknown ask or mark TODO", plus a validation step that fails if unfilled tokens remain unexplained, plus a "Follow-up TODOs if any placeholders intentionally deferred" section in the change report.

Combining those gives the right design: **an "Unverified / could not determine" section is a required output**, and an *empty* one is suspicious. This makes the model's uncertainty legible rather than laundering it into confident prose — directly countering §4.7. `retroprd`'s High/Medium/Low "reconstruction confidence marker" is the same idea applied per-claim.

### 5.5 Update incrementally; diff, don't rewrite

The evidence points at iteration over one-shot generation from several directions: Anthropic's `#` accretion model and "refine over time"; GitHub's 2,500-repo survey ("The best agent files grow through iteration, not upfront planning"); the Probe-and-Refine result if it holds (§4.1); and OpenCode's "improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims."

Claude's new `/init` has the best mechanic: on the update path, output **diffs with a one-line reason each**, then ask before applying. That makes the pruning half reviewable, which is the half people skip.

`context-architecture` goes further and forbids the big bang: "Never propose a big-bang restructuring. Order the work by leverage and reversibility… Output a backlog: each item is one PR-sized change, with the mechanism it lands with."

### 5.6 Verification passes

Three distinct passes are demonstrated somewhere in the corpus, and no single tool does all three:

1. **Reference check** — every path, command, symbol and URL cited must exist / run (`context-architecture`, `agents-lint`).
2. **Self-critique** — "Identify the most ambiguous or weak parts and ask about those" (Copilot `/create-instructions`).
3. **Completion check** — a machine-detectable criterion for "not finished", e.g. no unexplained placeholder tokens (spec-kit).

A fourth is available and unused: **lint your own output** against the `vague-platitudes` / `naked-donts` / `executable-command` / `line-budget` categories from `agents-md-cookbook` before saving.

### 5.7 Route the finding to the right artifact

Claude's new `/init` only. A finding becomes a **hook** if it must be guaranteed, a **skill** if it is an invocable workflow, a **prose note** if it merely shapes behaviour. Given §4.2 — instruction files are advisory and adherence is ~25–36% — this is arguably the highest-value single technique in the list. Every "you MUST always run the formatter" bullet is a hook that wasn't written.

### 5.8 Two-tier output: pointers, not payload

Universal in the good prompts, four different names: Copilot's "Link, don't embed"; Claude's `@path/to/import` for anything long or fast-changing; Kiro's three separately-refreshable steering files; `/initref`'s "reference files in /ref … Update CLAUDE.md file with the pointers". The always-loaded file should be mostly routing, with inline content reserved for gotchas that exist nowhere else.

---

## 6. Generating a GLOSSARY / domain vocabulary

**Verdict: nobody does this well, and the best academic result explains why.**

**No major harness ships a glossary command.** Claude Code `/init`, spec-kit, Kiro steering, Cursor and Copilot all produce technical orientation, not domain vocabulary. Everything in the space is low-star community skills — and the most influential one was *deprecated*: `mattpocock/skills`' `ubiquitous-language` skill (which scanned the *conversation*, not the repo) was folded into `domain-modeling` / `grill-with-docs`, moving further *away* from extraction and toward interrogation. The replacement's stance, verbatim from its own `SKILL.md`:

> "Merely *reading* `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it."

Its practices are challenge-against-the-glossary, sharpen-fuzzy-language, stress-test-with-scenarios, and cross-reference-with-code ("Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"). That last one is the interesting hybrid: **code as a contradiction detector, human as the source of truth.**

The evidence for why extraction is hard:

- **Wang, Peng, Liu, Xing, Bai, Xie, Wang, "A Learning-Based Approach for Automatic Construction of Domain Glossary from Source Code and Documentation", ESEC/FSE 2019** ([PDF](https://cspengxin.github.io/publications/fse19-wang-glossary.pdf), [DOI](https://dx.doi.org/10.1145/3338906.3338963)) — the one strong result, and it needs *multiple sibling projects in the same domain* to bootstrap: "it performs better when the target domain consists of projects that provide **similar functionalities**." On Hadoop it lost 0.280 recall to the baseline. **It does not work on a lone repo** — the authors' own reported result.
- **Arnaoudova, Di Penta, Antoniol, "Linguistic antipatterns: what they are and how developers perceive them", EMSE 21(1) 2016** ([DOI](https://link.springer.com/article/10.1007/s10664-014-9350-8)) — a catalogue of 17 documented inconsistencies among naming, documentation and implementation. A glossary mined from identifiers **inherits every naming lie in the repo and launders it into an authoritative-looking artifact.**
- **Abebe & Tonella, "Extraction of domain concepts from the source code", SCP 98(4) 2015** ([DOI](https://www.sciencedirect.com/science/article/pii/S0167642314004419)) — the technical lineage for identifier-parse-tree → ontology.
- **The bounded-context objection is structural, not tunable.** "Customer" is a lead to marketing, a prospect to sales, a consignee to the warehouse, a debtor to finance. A flat frequency-ranked extraction over a monorepo collapses several bounded contexts into one word list, destroying the exact distinction ubiquitous language exists to preserve. The one community skill that models this ([`tsipotU/glossary-skill`](https://github.com/tsipotU/glossary-skill), YAML-per-context with cross-context conflict flagging) has zero stars.
- **LLM-era evidence is thin.** Eisenreich, Jusic, Wagner, "Automating Domain-Driven Design: Experience with a Prompting Framework" ([arXiv:2603.26244](https://arxiv.org/abs/2603.26244)) reports that the ubiquitous-language / event-storming / bounded-context steps "worked well" and the framework "excels as a collaborative sparring partner for building actionable documentation, such as glossaries and context maps" — but its input is *requirements documents*, not a codebase, and later steps degraded as "accumulated errors rendered the artifacts generated from Steps 4 and 5 impractical". Their conclusion: "LLMs can enhance, but not replace, architectural expertise."

**There appears to be no peer-reviewed evaluation of LLM glossary extraction from source code.** That experiment has not been run.

**If you build one anyway:** mine for *candidates*, not conclusions. "Here are 40 terms that appear in identifiers across these paths, here are 6 that are used inconsistently between `src/ordering/` and `src/billing/`" is a useful, checkable output. "Here is your glossary" is not.

---

## 7. Retroactively generating ADRs from git history

**Verdict: nobody does this well, and the state-of-the-art academic system deliberately refuses to try the hard part.**

The decisive citation is **Shahbazian, Lee, Le, Brun, Medvidović, "Recovering Architectural Design Decisions", ICSA 2018** ([PDF](https://people.cs.umass.edu/~brun/pubs/pubs/Shahbazian18icsa.pdf)):

> "Modern architectural recovery techniques… focus on recovering **'what' the architecture of a system looks like, and not 'why' the architecture looks the way it does**, a symptom of a phenomenon known as **knowledge vaporization**."

> "The static architecture of a system explicitly captures the system's components… but **rationale is usually missing or, at best, implicit in the structural elements. For this reason, our approach focuses on the consequences of design decisions.**"

RecovAr recovers *consequences* from commits and **retrieves** rationale from linked issue-tracker entries. It never generates rationale. Results: 75% recall / 77% precision on Hadoop and Struts. Initial recall from commits alone was **~20%**, killed by "orphaned commits" never linked to an issue. And even with issues attached, rationale was often insufficient — their own worked example scores Rationale Clarity 0.5 because "the rationale summary does not explain why this needs to happen."

Supporting evidence that the "why" often simply isn't there to be found: Tian, Zhang, Stol, Jiang, Liu, **"What Makes a Good Commit Message?", ICSE 2022** ([arXiv:2202.02974](https://arxiv.org/abs/2202.02974)) — ~1,600 messages from five highly active OSS projects, **~40% missing information**.

And on LLM-generated rationale quality: Zhou, Li, Liang, Zhang, Shahin, Li, Yang, **"Using LLMs in Generating Design Rationale for Software Architecture Decisions", TOSEM 2025** ([arXiv:2504.20781](https://arxiv.org/abs/2504.20781)) — five LLMs × three prompting strategies × 100 architecture problems: **precision 0.267–0.278**, recall 0.627–0.715, F1 0.351–0.389; 64–69% of generated arguments not mentioned by experts were nonetheless judged helpful, but **1.59–3.24% were potentially misleading**. Read alongside Equal Experts' "sounds so credible that it discourages proper scrutiny" (§4.7), a few percent of confidently-wrong rationale in a document people trust is the failure that matters.

The ADR establishment is silent on backfilling. [npryce/adr-tools](https://github.com/npryce/adr-tools), [adr.github.io](https://adr.github.io/) and [log4brains](https://github.com/thomvaill/log4brains) say nothing about it; log4brains' immutability model ("you can become familiar with the whole project history just by reading its decision log in chronological order") is arguably hostile to bulk backfill. Nygard's [original 2011 post](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) does not address writing ADRs after the fact, though it supplies the motivation: "One of the hardest things to track during the life of a project is the motivation behind certain decisions."

The one clear endorsement is [Spotify's "When Should I Write an Architecture Decision Record"](https://engineering.atspotify.com/2020/04/when-should-i-write-an-architecture-decision-record) — but its trigger is human: "The introduction of a competing code pattern or library could lead the reviewer to discover an undocumented decision." One ADR at a time, triggered by friction, not a batch job over `git log`.

The skeptical framing worth keeping: Rick Pollick calls a post-hoc ADR written for compliance **"ratification theater"** — it records what happened rather than the reasoning ([rickpollick.com](https://rickpollick.com/blog/adr-comeback-anchoring-agentic-engineering-teams)).

**If you build one anyway:** the two design constraints the evidence supports are (1) **separate retrieved from inferred**, per claim, with a confidence marker; and (2) **mine for candidates, not conclusions** — output "here are 30 places a decision appears to have been made, with the commits, the PRs, and the issues that touch them" and let a human supply the *why*. That is what RecovAr does, what Equal Experts did, and what Spotify's flow assumes.

This repo's own `domain-modeling` skill already encodes the correct filter, and a generator should apply the same three-part test before proposing any ADR: hard to reverse, surprising without context, and the result of a real trade-off — "If any of the three is missing, skip the ADR."

---

## 8. Synthesis

### 8.1 What a great bootstrap prompt must instruct the agent to do

**Frame**

1. **State the reader model.** "Design for a reader who retains nothing between sessions and knows only what the repository says out loud." Everything else follows from it.
2. **State the inclusion test once, as a per-line filter, and apply it to every line.** "Would an agent likely miss this without help? If not, leave it out." (OpenCode) / "Would removing this cause Claude to make mistakes?" (Anthropic).
3. **Aim at instructions, not overviews.** The measured result is that instructions are followed and repository overviews are not (§4.1). Budget accordingly: the architecture section is the *first* thing to cut, not the centrepiece.
4. **Distinguish the durable always-loaded file from a disposable task brief.** "Overdoing it is better than underdoing it" is right for one and wrong for the other.

**Discover**

5. **Check for existing agent docs first, across every format**, and reuse rather than duplicate. Copilot's glob is the best published inventory: `.github/copilot-instructions.md, AGENT.md, AGENTS.md, CLAUDE.md, .cursorrules, .windsurfrules, .clinerules, .cursor/rules/**, .windsurf/rules/**, .clinerules/**, README.md` — plus `.devin/rules/`, `.clinerules`, `.mcp.json`, `.claude/rules/` from Claude's list.
6. **Inventory the repo's existing prose docs to decide what to *link*, not what to copy.** Produce a router, not a rewrite.
7. **Bound the exploration, and spend the budget adaptively.** "Up to 10 files… let your discoveries guide your exploration" (Gemini); fan out to subagents to keep the main context clean (Claude, Copilot).
8. **Set an evidence precedence order.** "Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source" (OpenCode). Manifests, CI config and scripts outrank the README.
9. **Read the files that explain how the system is wired together, not random leaf files.** Entrypoints, boundaries, execution flow.
10. **Mine git history** for commit-message and PR conventions (Codex) — the one place the *actual* convention is observable rather than declared.

**Verify** *(the tier nobody ships)*

11. **Run every command before writing it down.** Record exit codes. A documented command that fails on a clean checkout is worse than no command; the fix for that failure is the highest-value content in the file.
12. **Ground every claim in a path.** No path, no claim. This makes hallucination a formatting violation instead of a judgement call.
13. **Verify every reference you emit** — path, command, symbol, URL — before saving.

**Ask**

14. **Make the unknowns a first-class output of exploration**: "Note what you could NOT figure out from code alone — these become interview questions."
15. **Interview only about those.** "Do not ask about anything the repo already makes clear." One short batch. Team conventions, branch/PR/release expectations, undocumented prerequisites, accepted tech debt, what's intentionally weird.
16. **Draft, then ask about your own weakest parts.** "Identify the most ambiguous or weak parts and ask about those."

**Write**

17. **Route each finding to the right artifact**: must-happen → hook / pre-commit / CI / lint rule; invocable workflow → skill or command; behaviour-shaping → prose. Instruction files are advisory and adherence is poor; a bullet is the weakest available enforcement.
18. **Two-tier the output.** Pointers and `@`-imports in the always-loaded file; detail in referenced files. Anything that changes frequently is imported, never copied.
19. **Require an "Unverified / could not determine" section**, and treat an empty one as suspicious. Mark per-claim confidence where rationale is involved.
20. **Be specific.** "Use 2-space indentation in TypeScript" beats "Format code properly." One real code snippet beats three paragraphs describing the style.
21. **Include the negative space**: what never to touch, what looks wrong but is intentional, accepted tech debt and why.
22. **Never overwrite.** If a file exists: read it, treat it as the baseline, and propose **diffs with a one-line reason each** — additions *and* deletions — then ask before applying.
23. **Emit the freshness mechanism in the same change as the claim.** At minimum a doc-reference test asserting every cited path exists and every cited command runs. "A claim without a mechanism is the violation."
24. **Self-lint before saving**: no vague platitudes, no naked "don'ts" without the alternative, no non-executable commands, no unfilled placeholders, within the line budget.
25. **Scope-guard the session.** Bootstrapping writes docs and mechanisms; it does not start implementing features it noticed along the way.
26. **Say when it isn't worth it.** "If the repo is a throwaway or the problem is ill-defined, say the cost beats the return rather than applying the discipline anyway."

### 8.2 Anti-patterns

Ranked by how much damage they do.

1. **Confident prose about things the agent did not check.** The worst failure, because fluency suppresses review: "the clear, logical, and convincing LLM output sounds so credible that it discourages proper scrutiny." Every unverified claim should be visibly marked as such or not written.
2. **Documenting commands without running them.** Universal in shipped initialisers. A wrong command is actively harmful: agents run these.
3. **The repository overview.** Purpose, tech stack, architecture summary — the measured-unhelpful content, and the bulk of most generated files. "Anything Claude can figure out by reading code" is the test; Anthropic's `/doctor` exists to delete it afterwards.
4. **Restating the manifest.** `npm test`, `cargo test`, the dependency list, the framework name. Pre-caching what the agent would read anyway, at permanent context cost.
5. **A file-by-file directory tree.** Highest volume, lowest signal, fastest to rot.
6. **Hallucinated convention sections.** A "Coding Style & Naming Conventions" heading in a template *demands* content, so the model invents a style guide for a repo that has none. Fixed-outline prompts cause this structurally.
7. **Named filler sections.** "Common Development Tasks", "Tips for Development", "Support and Documentation" — Anthropic names these three because they recur.
8. **Generic best-practice boilerplate.** "Write clean code", "handle errors gracefully", "never commit secrets", "write unit tests for all new utilities". Zero behaviour change, non-trivial token cost.
9. **Rules a linter already enforces.** If a mechanism exists, prose about it is dead weight — and if no mechanism exists, prose is the wrong fix.
10. **Overwriting or blind-rewriting an existing file.** Destroys the hand-earned content, which is the only content that was working.
11. **Copying instead of linking.** Duplicating the README, CONTRIBUTING, or API docs into the always-loaded file guarantees two copies that diverge.
12. **Naked "don'ts".** A prohibition with no alternative leaves the agent to invent one.
13. **Shipping a claim with no mechanism to detect its decay.** Every generated file is a liability from the moment it is written unless something fails when it goes stale.
14. **One-shot and done.** No update path, no pruning ritual, no diff review. The evidence favours iteration; the fear of bloat is what kills the update habit, so the pruning half must be as easy as the adding half.
15. **Interviewing the human about things the repo already answers.** Burns the one budget you cannot refill: their patience.
16. **Producing multiple rival files** (`CLAUDE.md` *and* `AGENTS.md` *and* `copilot-instructions.md`) with independent content. Pick one; make the others one-line pointers.
17. **Auto-generating a domain glossary from identifiers.** Launders the repo's naming debt into an authoritative artifact, and flattens bounded contexts.
18. **Batch-generating retroactive ADRs from `git log`.** The "why" is frequently not in the history; what fills the gap is invented rationale in a credible voice. "Ratification theater."

---

## 9. Uncertain / unverified

- **Claude Code's prompts are extracted from an installed binary (2.1.191, June 2026)**, not from published source. The text is verbatim, but which prompt a given user gets is gated by a feature check — the command *description* switches on `process.env.CLAUDE_CODE_NEW_INIT`, and the prompt selection uses a separate internal predicate I did not decompile. Both prompts ship in the same binary. Newer releases may differ.
- **Cursor's generation prompt could not be obtained**, from docs or from the installed application. Everything in §1.7 is doc-level behaviour only. Likewise **Kiro** (§1.8) is closed-source; only the documented output shape is known.
- **arXiv:2606.20512 (Probe-and-Refine), arXiv:2605.10039 (factorial adherence study), arXiv:2603.26244 (Automating DDD), arXiv:2604.03826 (Context Matters), and arXiv:2607.25398 (HANDBOOK.md)** were reported by sub-agents; I independently verified **only** arXiv:2602.11988 (ETH, AGENTS.md) by fetching the abstract page. Treat the others' figures as second-hand until checked. The factorial adherence study in particular is a solo-author preprint with no institutional affiliation surfaced, and it **contradicts Anthropic's own size guidance** — that disagreement is unresolved and is reported as such in §4.3.
- **The "10–84% of symbol references are stale" figure is unverified and self-interested.** Do not cite as a measurement.
- **The "frontier LLMs reliably follow 150–200 instructions" figure** circulates widely and could not be traced to a primary measurement. Attributed to Opalic in §4.3; not relied on.
- **Anthropic's "run your CLAUDE.md through a prompt improver" advice** appears in older versions of the best-practices page and is **not** in the current live page. Cite only from an archive snapshot.
- **I did not systematically sample generated instruction files at scale.** The four examples in §1.10 were chosen by hand and are illustrative, not representative. The `/init` header string is a usable fingerprint if someone wants to do that survey properly.
- **The GitHub "2,500 repositories" post gives no statistics** — no average length, no section frequencies. Its conclusions are stated qualitatively and should be read as editorial, not measurement.
- **`context-architecture` is one author's methodology, self-published and not independently evaluated.** Its ideas are the best in the corpus; there is no evidence they produce better outcomes.
- **Nobody has published a controlled evaluation of retro-ADR quality against ground truth** (e.g. asking the original architects whether the generated rationale is right), nor of LLM glossary extraction from source code. Both experiments appear not to have been run.
- **The strongest claim in §5 — "run the commands before writing them down" — is unevidenced as a specific intervention.** It follows from Anthropic's general "give Claude a check it can run" guidance and from the fact that agents execute documented commands, but no one has measured whether verified-command instruction files outperform inferred ones.
