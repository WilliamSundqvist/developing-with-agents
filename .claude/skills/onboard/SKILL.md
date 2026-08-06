---
name: onboard
description: Write this repository's AGENTS.md from evidence, then interview about what evidence can't settle.
disable-model-invocation: true
---

# Onboard

Make an existing codebase legible to agents. Produce `AGENTS.md`, a `CLAUDE.md` stub, and empty `CONTEXT.md` and `docs/adr/` for grilling to fill later.

Your reader retains nothing between sessions and knows only what the repository says out loud — but it can read the code. So one test governs every line:

> Would a capable agent get this wrong without being told?

Architecture narratives, directory trees and dependency lists all fail it. They are the measured-useless part of an instruction file, and each one dilutes the lines that work. Write what the code **cannot say**: the unwritten convention, the reason behind a choice, the gotcha no config confesses.

Read [`AGENTS.example.md`](../../../AGENTS.example.md) before drafting — it is the target shape.

## Process

### 1. Verify

**Inherit before you write.** Search for `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`, `GEMINI.md`, `.github/instructions/`. Read every hit. You are revising something that encodes decisions you cannot see.

**Establish the commands by running them.** Read the manifest, the CI workflow and any task runner, then **execute** the build, test, lint and typecheck commands you find. A command that fails is not a command — find the one that works, or record that there isn't one. This step is what separates a useful file from a plausible one.

**Trust executable evidence over prose.** Manifests, CI configs and scripts outrank READMEs. Where they disagree, the workflow file is right.

**Read wiring, not leaves.** Entry points, route tables, module registries, config loaders, migrations. Bound it at roughly ten files and let each discovery pick the next read.

**Mine the history** — `git log --oneline -50` — for the commit and PR conventions people actually follow.

**Keep an unknowns list.** Anything you want to write but cannot trace to a file you read or a command you ran goes on the list instead. The list is an output, not a failure.

Done when every command in the draft has been executed, and every convention names the file that demonstrates it. Record paths repo-relative from the start — an absolute path is unreadable in a question and wrong in a committed document.

### 2. Interview

Run the `/grilling` skill against the unknowns list, and only that list. One question at a time, each with your recommended answer.

**Keep the question readable.** The question itself carries no file paths. Put evidence on its own line beneath it, as a repo-relative path with an optional line number — `src/orders/dispatch.ts:42`, never an absolute path. Two paths at most; a third means you are asking two questions.

Ask what no repository can tell you:

- Which of several plausible directories does a kind of change belong in?
- What has bitten people here that the code does not confess?
- What looks wrong but is deliberate — the thing a newcomer would "fix"?
- What is deliberately *not* done here, and why?

Anything unresolved goes under an **Unverified** heading, named as an open question. Resolving an unknown by writing something plausible is the one failure that cannot be caught in review — fluent prose about an unchecked thing reads exactly like a verified fact.

### 3. Write

**Write the files.** The editor shows the diff — a proposed document pasted into the conversation is unreadable and cannot be reviewed line by line. Say in two or three lines what you wrote and what stayed unresolved.

`AGENTS.md`, 120–180 lines, in the sections and at the density of [`AGENTS.example.md`](../../../AGENTS.example.md): Commands · Where to look · Deviations from the defaults · Gotchas · When to grill first · Definition of Done · Rules hygiene. A draft half again longer than the example is narrating — cut it back.

Three rules hold that density:

- **Verification is a gate, not content.** You ran the commands to find out which ones are real. Write the command. Add a note beside it only when the note is a trap the next agent would hit — "98 nullable warnings; keep cleanup out of feature work" earns its line, "succeeded locally" does not.
- **State the fact, not the ban.** "Local startup needs `KeyVault:Name` in user secrets" beats "do not assume local startup works from appsettings" — it is shorter, and a prohibition makes the wrong behaviour more available, not less.
- **Where to look stays a table.** One row per kind of change: task, path, note. Prose paragraphs per file are the same information at four times the length.

The Definition of Done is **one command**. Conditions about which parts to check belong in the work, not in the bar.

Then:

- **`CLAUDE.md`** containing exactly `@AGENTS.md`. A stub file — a symlink breaks on Windows checkouts.
- **`CONTEXT.md`** with its heading, one line of domain description, and an empty `## Language`. It stays empty: terms enter through grilling, confirmed by a human. A glossary harvested from code canonises whatever names are already there.
- **`docs/adr/`** with a `.gitkeep`. Records start here and arrive through grilling — rationale inferred from git history is rationale invented.

Where you are revising an existing file, justify the **deletions** as well as the additions — a line you removed is the one the human is most likely to want back.

Close by handing over the two things the human now owns: the Definition of Done stays green, and the next decision-bearing change starts with `/grill-with-docs`.
