# developing-with-agents

An opinionated standard for making a codebase one that coding agents can work in.

One path, already decided. If you want to know *why* a choice was made, [`docs/adr/`](docs/adr/) records the decision and [`docs/research/`](docs/research/) has the primary-source evidence behind it.

## Adopt it

Two steps, in your existing repository:

```bash
npx skills@latest add WilliamSundqvist/developing-with-agents
```

Then, in VS Code Copilot or Claude Code:

```
/onboard
```

`onboard` reads your codebase, runs your build and test commands to check they work, interviews you about what it couldn't work out on its own, and writes `AGENTS.md`, a `CLAUDE.md` stub and an empty `CONTEXT.md`. Budget 20–30 minutes of answering questions.

That's the whole setup. Everything after it is the working habit below.

**Requires VS Code 1.109+** for Agent Skills. Older versions read `AGENTS.md` and silently ignore the skills.

## The working habit

**Before a change that decides something, run `/grill-with-docs`.**

A decision-bearing change is one that adds or alters a design decision — a new module seam, a new dependency, a schema change, an external contract, agent behaviour, or a product rule. Grilling is a relentless one-question-at-a-time interview that walks the design tree with a recommendation attached to every question.

It fires automatically. The agent names the clause that triggered it and starts; if you'd rather get on with it, say so and it drops for that request. Mechanical work — renames, typos, dependency bumps, fixing a failing test — never triggers it.

The point isn't the interview. It's what falls out of it: the decision records and glossary entries get written **as a by-product of a conversation you wanted to have anyway**. Nobody is ever assigned documentation. That is the one mechanism this whole standard rests on.

## What every repository ends up with

| | |
|---|---|
| `AGENTS.md` | 120–180 lines: commands, a routing table, deviations from defaults, gotchas. No architecture overview — see [ADR-0006](docs/adr/0006-no-architecture-overview-in-the-instruction-file.md). |
| `CLAUDE.md` | One line: `@AGENTS.md`. Claude Code doesn't read `AGENTS.md` natively. |
| `CONTEXT.md` | The glossary. Starts empty; fills through grilling. |
| `docs/adr/` | Decision records. Start empty; fill through grilling. |
| a `check` command | Typecheck, lint, test, one command, non-zero exit. The Definition of Done. |

[`AGENTS.example.md`](AGENTS.example.md) and [`CONTEXT.example.md`](CONTEXT.example.md) are complete worked examples for a fictional API. They carry `.example` so no agent loads them. Read them for shape and length; never copy their facts.

## When things drift

Run `/audit-docs`. It checks the three documents against the code and against each other, and reports what it finds. It proposes superseding ADRs rather than editing old ones — a record that no longer matches reality is still the true statement of what was believed then.

Reach for it before onboarding someone new, after an agent has contradicted the docs, or after a refactor big enough to move vocabulary.

## What this is honest about

The evidence for instruction files is weaker than the industry acts like it is. A controlled evaluation found they don't generally improve task success rates while costing about 20% more inference; wrong documentation measures *worse than no documentation*; and compliance with policy documents tops out around 36%.

This standard is built around those findings rather than despite them:

- **Few, true, underivable.** If an agent can work it out by reading the code, it stays out of `AGENTS.md`.
- **A size budget**, enforced by `check`. Adding something means deciding what comes out. When an agent ignores an instruction, suspect the file's length before its phrasing.
- **A rule enters only after the same mistake happens twice.**
- **Anything that must always happen becomes a hook, a pre-commit gate or a lint rule** — never prose. Prose is for what should usually happen.

The grilling trigger is prose, so it's a roughly one-in-three mechanism ([ADR-0008](docs/adr/0008-instructions-not-hooks-for-now.md)). If you find people drifting past it, [`hooks/grilling-reminder.example.json`](hooks/) makes it a hook. It ships switched off because VS Code hooks are still Preview.

## Working on this repository

`npm run check` is the Definition of Done. It validates skill frontmatter, catches skills pointing at skills that aren't installed, and enforces the line budget on `AGENTS.md`.

The skills are a surgical fork of [mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Exactly one file is hand-edited — see [ADR-0002](docs/adr/0002-surgical-fork-of-upstream-skills.md) and [`NOTICE`](NOTICE). Keep the rest byte-identical so `npx skills update` stays usable, and re-check the edited file afterwards.
