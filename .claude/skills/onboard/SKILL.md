---
name: onboard
description: Write this repository's AGENTS.md from evidence, then interview about what evidence can't settle.
disable-model-invocation: true
---

# Onboard

Make an existing codebase legible to agents. Gather evidence, grill the human for what the evidence cannot supply, and produce `AGENTS.md`, a `CLAUDE.md` stub, `CONTEXT.md`, and any decision records the interview earned.

Your reader retains nothing between sessions and knows only what the repository says out loud — but it can read the code. So one test governs every line:

> Would a capable agent get this wrong without being told?

Architecture narratives, directory trees and dependency lists all fail it. They are the measured-useless part of an instruction file, and each one dilutes the lines that work. Write what the code **cannot say**: the unwritten convention, the reason behind a choice, the gotcha no config confesses.

Read [`AGENTS.example.md`](../../../AGENTS.example.md) before drafting — it is the target shape.

## Process

### 1. Gather evidence — in a subagent

**Dispatch a subagent to do this step.** Send it the brief below and nothing else. It must not see the output format, the section list, or the line budget: an agent that can see the shape of the document it is heading towards stops digging and starts drafting, and returns a tidy file it never verified.

Wait for it. You are not exploring; it is.

> **Subagent brief — gather evidence about this repository. You are not writing any document.**
>
> **Inherit first.** Search for `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.cursorrules`, `.windsurfrules`, `GEMINI.md`, `.github/instructions/`. Read every hit and report what it claims.
>
> **Establish the commands by running them.** Read the manifest, the CI workflow and any task runner, then **execute** every build, test, lint and typecheck command you find. Record the exit code. A command that fails is not a command — find the one that works, or report that none exists. Report failures in full: a command that fails for a missing secret or an absent service has told you something the next agent needs.
>
> **Trust executable evidence over prose.** Manifests, CI configs and scripts outrank READMEs. Where they disagree, the workflow file is right.
>
> **Read wiring, not leaves.** Entry points, route tables, module registries, config loaders, migrations. Bound it at roughly ten files and let each discovery pick the next read.
>
> **Mine the history** — `git log --oneline -50` — for the commit and pull request conventions people actually follow.
>
> Return three things, and nothing else:
>
> 1. **Evidence table** — one row per command: `command | exit code | what it proved`.
> 2. **Findings** — one line each, every one naming the repo-relative path that demonstrates it. No path, no finding.
> 3. **Unknowns** — anything you could not settle by reading or running. This list is an output, not a failure.
>
> Report no credential values. Name the mechanism and the file that holds it.

Done when the subagent has returned all three. If the evidence table is empty, the step did not happen — dispatch again rather than proceeding.

### 2. Interview

Start grilling as soon as the subagent reports. Do not summarise its findings and wait for permission — the human ran `/onboard` to be interviewed, and the interview is the part only they can supply.

**Ask in batches.** Almost everything you need here is an independent fact — which directory a change belongs in, what a word means, what bit someone last year. None of these answers changes what the next question should be, so asking them singly just makes the human wait through a queue. Send five to eight at a time as a numbered list, grouped by topic, each with your recommended answer so they can reply "1 yes, 2 it's actually X, 3 skip" in one message. Keep batching until the unknowns list is empty.

**Switch to one-at-a-time only when an answer opens a branch.** If a reply exposes a real design decision — hard to reverse, surprising, a genuine trade-off — run the `/grilling` skill for that thread alone: dependent questions asked singly, each with a recommendation, because there the answer to one determines whether the next is even the right question. Return to batching once the branch is resolved.

Run `/domain-modeling` throughout, so confirmed terms and agreed records are captured as they surface rather than noted for a later session.

**Keep each question readable.** The question itself carries no file paths. Put evidence on its own line beneath it, as a repo-relative path with an optional line number — `src/orders/dispatch.ts:42`, never an absolute path. Two paths at most; a third means it is two questions.

Cover the unknowns list first, then these — they are what no repository can tell you:

- Which of several plausible directories does a kind of change belong in?
- What has bitten people here that the code does not confess?
- What looks wrong but is deliberate — the thing a newcomer would "fix"?
- What is deliberately *not* done here, and why?
- **Vocabulary.** Take the three or four domain words that appear most in the code and ask what each one means *here*, and which near-synonyms the team avoids. A word carrying a local meaning is the single most valuable thing you can write down, and the code cannot tell you which meaning is intended.
- Any decision the subagent found evidence of but no rationale for — worth an ADR if it is hard to reverse, surprising, and the result of a real trade-off.

Anything unresolved goes under an **Unverified** heading, named as an open question. Resolving an unknown by writing something plausible is the one failure that cannot be caught in review — fluent prose about an unchecked thing reads exactly like a verified fact.

### 3. Write

**Write the files.** The editor shows the diff — a proposed document pasted into the conversation is unreadable and cannot be reviewed line by line. Say in two or three lines what you wrote and what stayed unresolved.

`AGENTS.md`, **60–100 lines**, in the sections and at the density of [`AGENTS.example.md`](../../../AGENTS.example.md): Commands · Where to look · Deviations from the defaults · Gotchas · When to grill first · Definition of Done · Rules hygiene. The example is 68 lines and covers a real service. `check` fails above 150.

**Every command you write appears in the evidence table with its exit code.** A command that is not in the table does not go in the file — not from a README, not from memory, not because it is obviously right. The same rule binds findings: each one carries the path the subagent named.

**Apply the editing test to every line before you write it:** *would removing this line cause the agent to make a mistake?* If not, cut it. Anthropic states the failure plainly — a bloated file makes the agent ignore the instructions that matter.

Write:

- Commands the agent cannot guess, and the flags that matter.
- Style rules that **differ** from the language's defaults.
- How to run one test rather than the whole suite.
- Branch and pull request conventions the history shows people actually follow.
- Environment quirks — required variables, services that must already be running.
- Gotchas and non-obvious behaviour.
- Decisions specific to this project, one line each.

Leave out:

- Anything derivable by reading the code.
- Standard language conventions the agent already knows.
- API documentation — link to it.
- Anything that changes often. A stale line measures worse than a missing one.
- File-by-file descriptions, directory trees, dependency lists.
- Tutorials and long explanations.
- Self-evident advice such as "write clean code".

**Never write a credential into the file.** No key, token, password or shared secret, even one already hardcoded in the source. Name the mechanism and the file that holds it. `AGENTS.md` loads into every agent's context on every turn and is committed to version control — it is the worst place in the repository for a secret to end up.

**The last two sections are boilerplate.** Copy `## When to grill first` and `## Rules hygiene` verbatim from the worked example; they are identical in every repository. Open questions belong under `## Unverified`, and code conventions under `## Deviations from the defaults` — neither goes in those two.

Three rules hold that density:

- **Verification is a gate, not content.** You ran the commands to find out which ones are real. Write the command. Add a note beside it only when the note is a trap the next agent would hit — "98 nullable warnings; keep cleanup out of feature work" earns its line, "succeeded locally" does not. A short file produced without running anything is not the goal: cutting the narration is a formatting win, and skipping the execution is losing the only thing that made the file trustworthy.
- **State the fact, not the ban.** "Local startup needs `KeyVault:Name` in user secrets" beats "do not assume local startup works from appsettings" — it is shorter, and a prohibition makes the wrong behaviour more available, not less.
- **Where to look stays a table.** One row per kind of change: task, path, note. Prose paragraphs per file are the same information at four times the length.

The Definition of Done is **one command**, and one you watched pass. Conditions about which parts to check belong in the work, not in the bar. A bar the repository cannot currently meet — "no warnings" where the build emits 98 — is worse than none, because the first person to try it learns the file lies.

Then:

- **`CLAUDE.md`** containing exactly `@AGENTS.md`. A stub file — a symlink breaks on Windows checkouts.
- **`CONTEXT.md`** with its heading, one line of domain description, and a `## Language` section holding the terms the human confirmed in step 2, each with the near-synonyms they rejected under `_Avoid_`. Only those. A term nobody confirmed stays out — a glossary harvested from code canonises whatever names happen to be there, which is the opposite of agreeing on language.
- **`docs/adr/`** holding any record the human agreed to during the interview, and a `.gitkeep` if there are none. Write only the rationale they gave you, in their words — reasoning reconstructed from git history is reasoning invented.

Where you are revising an existing file, justify the **deletions** as well as the additions — a line you removed is the one the human is most likely to want back.

Close by handing over the two things the human now owns: the Definition of Done stays green, and the next decision-bearing change starts with `/grill-with-docs`.
