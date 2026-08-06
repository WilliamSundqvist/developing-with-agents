# developing-with-agents

This standard makes the repository you already have into one that agents work well in.

It also makes your team agree with itself. Those are the same job.

## Why this exists

Most advice about AI-native development tells you to change things you do not control. Use this ticket system. Restructure the repository. Add this planning process. Your employer chooses the ticket system. Your team inherits the repository. You cannot start again on a Tuesday.

This standard covers one thing only: **the repository, and what one developer can change in it today.** You do not buy tools. You do not ask permission. You do not change how your company tracks work.

There is a second reason, and it matters more with time. A new agent and a new teammate fail on a repository for the same reasons:

- A rule that nobody wrote down.
- Code that looks wrong but is correct on purpose.
- A word that has a special meaning in this team.

You write these down for the agent. Your team gets them too. Agents are the first colleagues impatient enough to make you write them.

## How to add it

Do these two steps in the repository you already have.

**Step 1.** Install the skills:

```bash
npx skills@latest add WilliamSundqvist/developing-with-agents
```

The skills go into `.claude/skills/`. This folder is not only for Claude. VS Code Copilot reads `.claude/skills/` and `CLAUDE.md` by default, with no settings to change. One set of files works in both tools.

**Step 2.** In VS Code Copilot or Claude Code, type:

```
/onboard
```

`/onboard` does four things. It reads your code. It runs your build and test commands, to make sure they work. It asks you about what it cannot find out alone. Then it writes `AGENTS.md`, a `CLAUDE.md` stub, and an empty `CONTEXT.md`.

Keep 20 to 30 minutes free. `/onboard` asks you questions, and your answers are the part that agents cannot get from the code.

You need VS Code 1.109 or later. Older versions read `AGENTS.md` but ignore the skills.

## The habit

**Before you make a change that decides something, the agent runs `/grill-with-docs`.**

A change decides something when it adds or alters:

- a new module boundary
- a new dependency
- a database or data-shape change
- an agreement with an external system
- agent behaviour
- a product rule

We call this a **decision-bearing change**. Everything else is mechanical: renames, typos, dependency updates, and fixes to a failing test. Mechanical work starts immediately.

The agent starts the interview itself. It tells you which rule applies, then asks the first question. If you prefer to continue, say so. The agent stops the interview for that request.

The interview is not the goal. The result is. While you talk, the agent writes the decision record and the new glossary words. **You get the documents from a conversation that you wanted to have.** Nobody writes documentation as a separate task.

This is the one idea that the whole standard depends on. It also keeps the documents true, because the agent writes them at the moment you make the decision.

## The seven skills, and when to use each

You type five of these. Two run by themselves.

### You type these

| Skill | Type it when | What it does |
|---|---|---|
| `/onboard` | Once, when you add this standard to a repository. | Reads your code, runs your commands, interviews you, and writes `AGENTS.md`, `CLAUDE.md` and an empty `CONTEXT.md`. |
| `/grill-with-docs` | Before you build something that decides how the system works. | Interviews you one question at a time. Writes the decision record and glossary words as you talk. Also starts by itself — see above. |
| `/audit-docs` | When the documents feel wrong. Also before a new person joins, and after a large refactor. | Compares `AGENTS.md`, `CONTEXT.md` and the decision records against the code and against each other. Reports what does not agree. |
| `/handoff` | When a session gets too long, or you must stop in the middle of a task. | Writes a summary that the next agent session can continue from. |
| `/grilling` | When you want the interview, but nothing is being decided and no document is needed. | The same interview, with no documents. |

### These run by themselves

| Skill | When it runs |
|---|---|
| `domain-modeling` | During grilling, when a word or a decision becomes clear. It writes the glossary entry and the decision record. |
| `writing-for-agents` | When you or an agent edits `AGENTS.md`, `CLAUDE.md`, or a skill. It supplies the rules for writing documents that agents read. |

**Start with two.** Use `/onboard` one time. Then use `/grill-with-docs` before each decision-bearing change. The other five are there when you need them.

## What each repository gets

| File | Purpose |
|---|---|
| `AGENTS.md` | 120 to 180 lines. Commands, where to find things, differences from the defaults, and known traps. It has no architecture description — see [ADR-0006](docs/adr/0006-no-architecture-overview-in-the-instruction-file.md). |
| `CLAUDE.md` | One line: `@AGENTS.md`. Claude Code does not read `AGENTS.md` directly. |
| `CONTEXT.md` | The words your team agrees on. It starts empty and fills up through grilling. |
| `docs/adr/` | Decision records. They start empty and fill up through grilling. |
| a `check` command | Type check, lint, and tests. One command. It fails with a non-zero exit code. This is the Definition of Done. |

[`AGENTS.example.md`](AGENTS.example.md) and [`CONTEXT.example.md`](CONTEXT.example.md) are complete examples for an API that does not exist. The name ends in `.example`, so no agent reads them. Use them to see the correct shape and length. Do not copy their contents.

## What we did not include

These skills come from [mattpocock/skills](https://github.com/mattpocock/skills). It is the best collection available. We did not take all of it. Three rules decided what to take.

**1. Nothing that needs infrastructure you do not control.** Your employer chooses the ticket system. A standard that expects you to change it is a standard you cannot use. The ticket and specification skills stay out.

**2. Nothing that decides how your team builds.** Test-first development, code review, and debugging methods are your decisions. This standard makes a repository easy to understand. It does not tell you how to write software.

**3. The number of skills is a budget.** Tests show that success rates fall 8 to 21 percent as collections grow to 52, 102, and 202 skills. The cause is *shadowing*: skills compete to match your request. To add a skill, say which of the seven it competes with.

We installed four skills and then removed them. This shows the rules work:

- `wayfinder` — multi-session planning built on tickets. Rule 1.
- `improve-codebase-architecture` — it improves code, but it does not make the repository easier to understand. Rule 2.
- `codebase-design` — the same reason. Rule 2.
- `grill-me` — grilling with no documents. It gives you a way to avoid the one idea that this standard depends on.

## What we are honest about

The evidence for instruction files is weaker than the industry says. A controlled test found that they do not usually improve success rates, and they cost about 20 percent more tokens. Wrong documentation measures *worse than no documentation*. Agents follow policy documents about 36 percent of the time at best.

We built this around those results:

- **Few, true, and impossible to derive.** If an agent can find it by reading the code, keep it out.
- **A size limit**, which `check` enforces. To add a line, decide which line to remove. When an agent ignores an instruction, look at the length of the file before you change the words.
- **A rule enters the file after the same mistake happens twice.** Not the first time.
- **Something that must always happen becomes a hook, a commit gate, or a lint rule.** Text is for what should usually happen.

The grilling rule is text, so it works about one time in three ([ADR-0008](docs/adr/0008-instructions-not-hooks-for-now.md)). If your team goes past it too often, [`hooks/grilling-reminder.example.json`](hooks/) makes it a hook. It is off, because VS Code hooks are still a preview feature.

Every decision is in [`docs/adr/`](docs/adr/). The research behind it is in [`docs/research/`](docs/research/). Read the record before you disagree with a decision. Two of them do not agree with the published evidence, and they say so.

## Work on this repository

`npm run check` is the Definition of Done. It checks the skill files, finds skills that point to skills nobody installed, enforces the line limit on `AGENTS.md`, and makes sure the one hand-edited skill has not gone back to the original.

**Do not run `npx skills` in this repository.** It writes a `skills-lock.json`, and the CLI will not re-export a skill that a lock file claims for another source. With a lock here, teams who install from this repository get two skills instead of seven ([ADR-0011](docs/adr/0011-the-fork-is-complete-not-surgical.md)). `check` fails if one appears.

If you run it by accident:

```bash
rm skills-lock.json && npm run skills:flatten && npm run check
```

`skills:flatten` also turns the symlinks the CLI creates back into real folders.

We own all seven skills. Improvements from [mattpocock/skills](https://github.com/mattpocock/skills) arrive by reading that repository and copying what is worth having. The licence and the list of derived files are in [`NOTICE`](NOTICE).
