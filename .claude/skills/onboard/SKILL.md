---
name: onboard
description: Onboard an agent onto an existing codebase — write its AGENTS.md, CLAUDE.md stub and empty CONTEXT.md from evidence. Use once per repository, when adopting the agentic development standard or when the instruction file has rotted past repair.
disable-model-invocation: true
---

# Onboard

Write this repository's `AGENTS.md` from **evidence**, then interview the human about what no evidence can settle.

Your reader is an agent that retains nothing between sessions and knows only what the repository says out loud. It is also capable: it can read the code. So one test governs every line you write:

> Would a capable agent get this wrong without being told?

If it can be derived by looking, leave it out. Architecture narratives, directory trees and dependency lists all fail this test — they are the measured-useless part of an instruction file, and every line you spend on them dilutes the lines that work.

## Phase 1 — Verify

Work through all of these before writing anything.

**Find what already exists.** Search for `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`, `GEMINI.md`, `.github/instructions/`. Read every hit. You are revising, not replacing — an existing file encodes decisions you cannot see.

**Establish the commands, by running them.** Read the manifest, the CI workflow and any task runner, then **execute** the build, test, lint and typecheck commands you found. A command that fails is not a command; find the one that works or record that there isn't one. This is the step that separates a useful file from a plausible one — no shipped initialiser does it, and a stale command copied from a README costs the next agent an hour.

**Prefer executable evidence.** Manifests, CI configs and scripts outrank prose. Where a README contradicts a workflow file, the workflow file is right and the README is stale.

**Read wiring, not leaves.** Entry points, route tables, module registries, config loaders, migrations. Bound the exploration at roughly ten files and let what you find direct the next read rather than walking the tree.

**Mine the git history** for the real commit and pull request conventions — `git log --oneline -50`. What people actually do outranks what CONTRIBUTING.md says they do.

**Keep an unknowns list as you go.** Every time you want to write something you cannot trace to a file you read or a command you ran, it goes on the list instead. The list is a first-class output, not a failure.

Phase 1 is complete when every command in your draft has been executed, and every convention in it names the file that demonstrates it.

## Phase 2 — Interview

Ask the human about the unknowns list, and only about that. Do not ask what you could have run.

One question at a time, each with your recommended answer, in the style of `/grilling`. Aim at the things no repository can tell you:

- Which of several plausible directories does a given kind of change belong in?
- What has bitten people here that the code does not confess?
- What looks wrong but is deliberate — the thing a newcomer would "fix"?
- What is deliberately *not* done here, and why?

Anything the human cannot settle either stays out or goes into an explicit **Unverified** section. Never resolve an unknown by writing something plausible: fluent prose about an unchecked thing is harder to catch in review than an obvious gap, because it reads like it was verified.

## What you write

Follow the shape in [`AGENTS.example.md`](../../../AGENTS.example.md) — read it before drafting. Target 120–180 lines. Sections: Commands · Routing table · Deviations from default · Gotchas · Grilling rule · Definition of Done · Rules Hygiene.

Also produce:

- **`CLAUDE.md`** containing exactly `@AGENTS.md` — a stub file, never a symlink.
- **`CONTEXT.md`** with its heading, its one-line description of the domain, and an empty `## Language` section. Leave it empty even when the code is full of domain words. Terms enter through grilling, confirmed by a human; a glossary harvested from code canonises whatever names are already there, which is the opposite of what a glossary is for.
- **`docs/adr/`**, empty, with a `.gitkeep`. Do not reconstruct past decisions from git history — inferred rationale is invented rationale.

## Finishing

Present a diff with reasons, additions **and** deletions both justified, and get agreement before applying. Never blind-overwrite an existing instruction file.

Close by telling the human the two things they now own: the Definition of Done command must stay green, and the next decision-bearing change should start with `/grill-with-docs`, which is what fills `CONTEXT.md` and `docs/adr/` over time.
