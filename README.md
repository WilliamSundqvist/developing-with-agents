# developing-with-agents

Coding agents fail on your repository for the same reasons new colleagues do: a convention nobody wrote down, code that looks wrong but is deliberate, a word that means something specific on this team. The difference is that agents fail this way *every session*, which finally makes it worth writing the answers down.

This is an opinionated standard for doing that. It covers one thing — **the repository, and what a single developer can change in it today.** No new tooling, no process to negotiate, nothing that touches how your company tracks work. Drop it into a codebase you already have and it takes about half an hour.

The documents that make agents effective turn out to be the documents that make a team agree with itself. That's the real return.

**Credit and further reading.** The skills are forked from [mattpocock/skills](https://github.com/mattpocock/skills), which is worth reading in full. For a detailed walkthrough of the workflow at the centre of this standard, watch Matt Pocock's [I stopped using /grill-me for coding. Here's what I use instead](https://www.youtube.com/watch?v=6BB6exR8Zd8) — it introduces `/grill-with-docs`, which combines the interview with domain-driven design so you and the agent end up sharing a language rather than guessing at each other's.

## Install

Two commands in the repository you want to improve.

```bash
npx skills@latest add WilliamSundqvist/developing-with-agents
```

Then, in VS Code Copilot or Claude Code:

```
/onboard
```

`/onboard` reads your codebase, executes your build and test commands to confirm they actually work, interviews you about what it couldn't determine on its own, and writes `AGENTS.md`, a `CLAUDE.md` stub, and an empty `CONTEXT.md`. Set aside 20–30 minutes — the interview is where the valuable content comes from, because it's the part no agent can extract from source.

**Requirements:** VS Code 1.109 or later for Agent Skills. Earlier versions read `AGENTS.md` but ignore the skills entirely.

<details>
<summary>Why the skills install to <code>.claude/skills/</code> even on Copilot</summary>

`.claude/skills/` is one of VS Code's four default skill locations, alongside `.github/skills/` — enabled out of the box, no settings to change. Claude Code reads only `.claude/`, so it's the single directory both tools find. VS Code reads `CLAUDE.md` by default too. The naming is a historical artifact, not a compatibility signal.

</details>

## The one habit that matters

**Before a change that decides something, the agent runs `/grill-with-docs`.**

A *decision-bearing change* adds or alters a module boundary, a dependency, a schema, an external contract, agent behaviour, or a product rule. Everything else is mechanical — renames, typos, dependency bumps, fixing a failing test — and proceeds with no ceremony at all.

The agent fires it without being asked. It names the clause that triggered, then asks the first question; if you'd rather get on with it, say so and it drops for that request.

The interview isn't the point. **The decision record and the glossary entries get written as a by-product of a conversation you wanted to have anyway.** Nobody is ever assigned documentation, and the documents stay true because they're written at the moment the decision is made rather than reconstructed later by someone guessing.

That single mechanism is what the rest of this standard is built on.

## Reference

Any skill can be invoked by typing its name. The distinction below is whether the *agent* can reach it on its own.

**Agent-invoked** — fire automatically when relevant, and can be typed:

| Skill | Fires when |
|---|---|
| `grill-with-docs` | A request carries a design decision. The interview above. |
| `grilling` | You want the interview without producing documents. |
| `domain-modeling` | A term or decision crystallises mid-conversation. Writes the glossary entry and the ADR. |
| `writing-for-agents` | Anyone edits `AGENTS.md`, `CLAUDE.md`, or a skill. Supplies the rules for documents agents read. |

**You-invoked** — deliberate, never automatic:

| Skill | Reach for it when |
|---|---|
| `onboard` | Adopting this standard in a repository. Once per repo. |
| `audit-docs` | The documents feel wrong; before onboarding someone new; after a refactor large enough to move vocabulary. |
| `handoff` | A session has run long, or you need to stop mid-task and continue elsewhere. |

Two are enough to start: `/onboard` once, then `/grill-with-docs` before each decision-bearing change.

## What a repository ends up with

| | |
|---|---|
| `AGENTS.md` | 60–100 lines. Commands, a routing table, deviations from defaults, gotchas. No architecture overview — [ADR-0006](docs/adr/0006-no-architecture-overview-in-the-instruction-file.md). |
| `CLAUDE.md` | A one-line stub: `@AGENTS.md`. Claude Code doesn't read `AGENTS.md` natively. |
| `CONTEXT.md` | Your team's shared vocabulary. Starts empty, fills through grilling. |
| `docs/adr/` | Decision records. Start empty, fill through grilling. |
| a `check` command | Typecheck, lint, tests — one command, one exit code. The Definition of Done. |

[`AGENTS.example.md`](AGENTS.example.md) and [`CONTEXT.example.md`](CONTEXT.example.md) are complete worked examples for a fictional service. The `.example` suffix means no agent loads them. Read them for shape and density; the facts in them are invented.

## Scope

These skills are forked from [mattpocock/skills](https://github.com/mattpocock/skills), the best-written collection available — but deliberately not all of it. Three rules governed what came across.

**Nothing that requires infrastructure you don't control.** Employers choose ticket systems; a standard that assumes you can swap yours is one nobody can adopt. The ticket and spec workflows stay out however good they are.

**Nothing that decides how your team builds.** Test-first, code review, debugging method — those are your calls. This standard makes a repository legible. It doesn't prescribe how you write software.

**Skill count is a budget.** Measured pass rates fall 8–21% as collections grow to 52, 102, and 202 skills, through *shadowing* — skills competing to match a request — rather than token cost. Adding one means naming which of the seven it now competes with.

Four skills were installed and then removed under those rules: `wayfinder`, `improve-codebase-architecture`, `codebase-design`, and `grill-me` — the last because grilling-without-documents is an exit from the one mechanism everything else depends on.

## Evidence and limitations

The case for instruction files is weaker than the industry generally admits. A controlled evaluation found they don't reliably improve task success while costing roughly 20% more inference. Wrong documentation measures *worse than none at all*. Compliance with policy documents tops out around 36%.

This standard is designed around those findings rather than in spite of them:

- **Few, true, and underivable.** Anything an agent can work out by reading the code stays out.
- **A hard size cap**, enforced by `check`. Adding a line means choosing one to remove. When an agent ignores an instruction, suspect the file's length before its wording.
- **A rule earns its place only after the same mistake happens twice.**
- **Anything that must always happen becomes a hook, a pre-commit gate, or a lint rule.** Prose is for what should usually happen.

The grilling trigger is prose, which makes it roughly a one-in-three mechanism ([ADR-0008](docs/adr/0008-instructions-not-hooks-for-now.md)). If teams drift past it, [`hooks/grilling-reminder.example.json`](hooks/) converts it to a hook — shipped disabled, because VS Code hooks are still in preview.

Every decision is recorded in [`docs/adr/`](docs/adr/), with the primary-source research behind it in [`docs/research/`](docs/research/). Two ADRs knowingly depart from the published evidence and say so. Read the record before overturning a decision.

## Contributing

`npm run check` is the Definition of Done: it validates skill frontmatter, catches skills referencing skills that aren't installed, enforces the line cap on `AGENTS.md`, and verifies the auto-fire trigger on `grill-with-docs` is intact.

Changing the standard is itself a decision-bearing change, so it starts with `/grill-with-docs` and lands with an ADR.

**Don't run `npx skills` in this repository.** It writes a `skills-lock.json`, and the CLI won't re-export skills a lock file attributes to another source — teams would receive two skills instead of seven ([ADR-0011](docs/adr/0011-the-fork-is-complete-not-surgical.md)). `check` fails if one appears. To recover:

```bash
rm skills-lock.json && npm run skills:flatten && npm run check
```

We own all seven skills outright; there's no upstream update path. Improvements from `mattpocock/skills` arrive by reading that repository and porting what's worth having.

## Licence

MIT — see [`LICENSE`](LICENSE). The forked skills remain under Matt Pocock's MIT licence, reproduced with attribution in [`NOTICE`](NOTICE).
