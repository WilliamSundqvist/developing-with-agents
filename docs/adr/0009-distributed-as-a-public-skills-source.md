# Distributed as a public skills source

The repository is published publicly and installed with `npx skills add <org>/<repo>`. The `skills` CLI treats any repository containing `SKILL.md` files as a valid source — no publishing, registration or manifest step — so adoption is two commands: install the skills, then run `onboard`.

## Consequences

When we improve a skill, every project picks it up with `npx skills update`, which is the leverage a company standard needs and a hand-copied kit cannot provide. The repository itself stays readable on the web as the guide — the worked examples and the research are read, never installed. `AGENTS.md` and `CONTEXT.md` are never copied by any route, because a copied instruction file is a confident statement about someone else's codebase. Note the CLI's open update bugs recorded in ADR-0002.
