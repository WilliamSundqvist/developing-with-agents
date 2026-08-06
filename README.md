# developing-with-agents

Make the repository you already have into one that agents work well in — and that your team shares an understanding of.

## Why this exists

Most advice about "AI-native development" asks you to change things you don't control. Adopt this ticket system. Restructure the monorepo. Run this planning ritual. Employers pick ticket systems; teams inherit repositories; nobody gets to start over on a Tuesday.

So this standard covers exactly one thing: **the repository, and what a developer can change inside it today.** No new tooling to buy, no process to negotiate, nothing that touches how your company tracks work.

The second reason is the one that matters more over time. An agent and a new teammate fail on the same repository for the same reasons — the convention nobody wrote down, the deliberate weirdness that looks like a bug, the word that means something specific here. Writing those down for the agent writes them down for the team. **The documents that make agents effective are the documents that make a team agree with itself**, and agents are the first collaborators impatient enough to make you actually write them.

## Adopt it

Two steps, inside your existing repository:

```bash
npx skills@latest add WilliamSundqvist/developing-with-agents
```

Then, in VS Code Copilot or Claude Code:

```
/onboard
```

`onboard` reads your codebase, **runs** your build and test commands to check they really work, interviews you about what it couldn't work out alone, and writes `AGENTS.md`, a `CLAUDE.md` stub and an empty `CONTEXT.md`. Budget 20–30 minutes of answering questions.

That's the setup. Everything after it is the habit below.

**Requires VS Code 1.109+** for Agent Skills. Older versions read `AGENTS.md` and silently ignore the skills.

## The habit

**Before a change that decides something, run `/grill-with-docs`.**

A decision-bearing change adds or alters a design decision — a new module seam, a new dependency, a schema change, an external contract, agent behaviour, or a product rule. Grilling is a relentless one-question-at-a-time interview that walks the design tree, with a recommended answer attached to every question.

It fires on its own. The agent names the clause that triggered it, then starts; if you'd rather get on with it, say so and it drops for that request. Mechanical work — renames, typos, dependency bumps, fixing a failing test — never triggers it.

The interview isn't the point. What falls out of it is: the decision records and glossary entries get written **as a by-product of a conversation you wanted to have anyway.** Nobody is ever assigned documentation. That single mechanism is what this whole standard rests on — and it's why the docs stay true, because they're produced at the moment the decision is made rather than reconstructed later by someone guessing.

## What every repository ends up with

| | |
|---|---|
| `AGENTS.md` | 120–180 lines: commands, a routing table, deviations from defaults, gotchas. No architecture overview — [ADR-0006](docs/adr/0006-no-architecture-overview-in-the-instruction-file.md). |
| `CLAUDE.md` | One line: `@AGENTS.md`. Claude Code doesn't read `AGENTS.md` natively. |
| `CONTEXT.md` | The team's shared vocabulary. Starts empty; fills through grilling. |
| `docs/adr/` | Decision records. Start empty; fill through grilling. |
| a `check` command | Typecheck, lint, test — one command, non-zero exit. The Definition of Done. |

[`AGENTS.example.md`](AGENTS.example.md) and [`CONTEXT.example.md`](CONTEXT.example.md) are complete worked examples for a fictional API. They carry `.example` so no agent loads them. Read them for shape and length; never copy their facts.

When things drift, run `/audit-docs`. It checks all three against the code and each other, and proposes superseding records rather than editing old ones — an ADR that no longer matches reality is still the true statement of what was believed then.

## The skills, and why only these

Eleven, doing four jobs:

| | |
|---|---|
| `grill-with-docs` · `grilling` · `grill-me` · `domain-modeling` | The loop. Grilling produces the decision; `domain-modeling` turns it into a record and a glossary entry. `grill-me` is the same interview without the paperwork. |
| `onboard` · `audit-docs` | Start the documents, then keep them honest. The only two written here. |
| `codebase-design` · `improve-codebase-architecture` | Shared vocabulary for the decisions grilling surfaces, and a way to go looking for them. |
| `writing-for-agents` · `handoff` · `wait-what` | Editing agent-facing documents, carrying context between sessions, and recovering when an explanation doesn't land. |

They're a fork of [mattpocock/skills](https://github.com/mattpocock/skills), which is the best-written collection available — and deliberately not all of it. Two rules decided what came across:

**Nothing that requires changing infrastructure you don't control.** Ticket systems are imposed by employers, not chosen by teams; a standard that assumes you can swap yours is a standard nobody can adopt. So the ticket and spec workflows stay out, however good they are. This repo's whole promise is that you can adopt it this afternoon, alone, without asking anyone.

**Skill count is a budget, not a collection.** Measured pass rates fall 8–21% as libraries grow to 52–202 skills, and the cause is *shadowing* — skills competing to match a request — not token cost. Every skill added makes the ones you depend on fire less reliably. Adding one means naming which existing skill it now competes with.

`wayfinder` was taken and then dropped: multi-session planning built on tickets, and it pulled in two more skills as dependencies.

## What this is honest about

The evidence for instruction files is weaker than the industry acts like it is. A controlled evaluation found they don't generally improve task success rates while costing about 20% more inference; wrong documentation measures *worse than no documentation*; and compliance with policy documents tops out around 36%.

This is built around those findings rather than despite them:

- **Few, true, underivable.** If an agent can work it out by reading the code, it stays out.
- **A size budget**, enforced by `check`. Adding means deciding what comes out. When an agent ignores an instruction, suspect the file's **length** before its phrasing.
- **A rule enters only after the same mistake happens twice.**
- **Anything that must always happen becomes a hook, a pre-commit gate or a lint rule** — never prose. Prose is for what should usually happen.

The grilling trigger is prose, so it's roughly a one-in-three mechanism ([ADR-0008](docs/adr/0008-instructions-not-hooks-for-now.md)). If people drift past it, [`hooks/grilling-reminder.example.json`](hooks/) makes it a hook — shipped switched off, because VS Code hooks are still Preview.

Every choice here is recorded in [`docs/adr/`](docs/adr/) with the primary-source evidence in [`docs/research/`](docs/research/). Disagree with one, read its record first — including the two places this knowingly deviates from the published evidence.

## Working on this repository

`npm run check` is the Definition of Done. It validates skill frontmatter, catches skills pointing at skills that aren't installed, and enforces the line budget on `AGENTS.md`.

Exactly one forked file is hand-edited — see [ADR-0002](docs/adr/0002-surgical-fork-of-upstream-skills.md) and [`NOTICE`](NOTICE). Keep the rest byte-identical so `npx skills update` stays usable, and re-check the edited file afterwards.
