# developing-with-agents

The company standard for making a codebase agents can work in. Everything here is either the standard itself, a worked example of it, or the evidence behind it.

## Commands

| | |
|---|---|
| `npm run check` | **Definition of Done.** Validates skills, pointers, and the mandated documents. Must exit 0. |
| `npm run skills:flatten` | Only after running `npx skills` here. Turns its symlinks back into real directories. |

No build, no tests. `check` is the only gate.

## Where to look

| Task | Where | Notes |
|---|---|---|
| Change the standard itself | `AGENTS.example.md` | The worked example *is* the standard. Changing it changes what every repo gets. |
| Change what grilling fires on | `.claude/skills/grill-with-docs/SKILL.md` | The `description` is the mechanism, not documentation of it. |
| Change how repos get onboarded | `.claude/skills/onboard/SKILL.md` | |
| Add a company-owned skill | `.claude/skills/<name>/` | Then justify it against the skill budget below. |
| Record a decision | `docs/adr/` | Sequential, `NNNN-slug.md`. Never edit an accepted one — supersede it. |
| Check a claim in the standard | `docs/research/` | Primary-source research, cited. Read before arguing with a decision. |

## Deviations from the defaults

- **We own all seven skills outright** ([ADR-0011](docs/adr/0011-the-fork-is-complete-not-surgical.md)). There is no `skills-lock.json` and no upstream update path — a lock file makes the `skills` CLI refuse to re-export the locked skills, so teams received two of seven. Improvements from [mattpocock/skills](https://github.com/mattpocock/skills) arrive by reading it and porting what is worth having.
- **`.claude/skills/*` are real directories, never symlinks.** They were symlinks once; on a Windows checkout with `core.symlinks` false, git writes the link path into a plain text file and the whole tree silently becomes garbage.
- **No `.github/copilot-instructions.md`** ([ADR-0003](docs/adr/0003-one-instruction-file-with-a-claude-md-stub.md)). VS Code combines it with `AGENTS.md` in no guaranteed order, so a second file is a second source of truth, not redundancy.
- **`AGENTS.md` carries no architecture overview** ([ADR-0006](docs/adr/0006-no-architecture-overview-in-the-instruction-file.md)). This deviates from near-universal practice and is deliberate.

## Gotchas

- Never commit a `skills-lock.json` here. Running `npx skills add` in this repo recreates one, and it silently drops every locked skill from what teams can install. Delete it and run `npm run skills:flatten`.
- The worked examples are `.example.md` so no agent loads them. Renaming one to `AGENTS.md` would make a fictional API's facts live in this repo.
- **Skill count is a budget.** Measured pass rates drop 8–21% as libraries grow to 52–202 skills, through shadowing rather than token cost. Adding one means naming which of the seven it competes with, and clearing the exclusion rules in [ADR-0010](docs/adr/0010-skills-that-require-infrastructure-we-do-not-control-stay-out.md).
- Agent Skills need **VS Code 1.109+**. Older versions read `AGENTS.md` and silently ignore everything in `.claude/skills/`.

## When to grill first

A change that adds or alters a design decision — a new module seam, a new dependency, a schema change, an external contract, agent behaviour, or a product rule — starts with `/grill-with-docs`, which produces the ADR and any glossary entries as a by-product. Name the clause that fired, then start. If I'd rather get on with it, I'll say so.

Mechanical work — renames, typos, dependency bumps, fixing a failing test, applying a pattern that already exists here — just gets done.

Changing the standard is itself always a decision-bearing change.

## Definition of Done

`npm run check` exits 0.

## Rules hygiene

Target **60–100 lines**, hard cap **150**; `check` enforces the cap. Adding something means deciding what comes out.

Every line must pass one test: **would removing it cause the agent to make a mistake?** If not, cut it.

A rule earns a place here only after the same mistake has happened **twice**.

Two diagnostics. When an agent **ignores** an instruction here, the file is too long and the rule got lost. When an agent **asks** something this file already answers, that line is ambiguous.

Anything derivable by reading the code stays out. This file is for what the code cannot say.

Docs are reviewed in the pull request that changes the behaviour they describe.
