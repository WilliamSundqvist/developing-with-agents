# Surgical fork of upstream skills

> **Superseded by [ADR-0011](0011-the-fork-is-complete-not-surgical.md).** Keeping `skills-lock.json` so `npx skills update` stayed usable made the standard undeliverable — the CLI would not re-export locked skills, so teams received two of seven. The fork is now complete.

The skills come from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT, © 2026 Matt Pocock), whose author explicitly sanctions editing your installed copies. We take ownership of them but hand-edit only what the design requires, leaving every other file byte-identical so `npx skills update` remains usable.

The required edits are: remove `disable-model-invocation` from `grill-with-docs` and rewrite its `description` to carry the trigger list from ADR-0001, since that description is the mechanism the model matches against; and add the `grilling` skill, which the original install missed and without which `grill-with-docs` is a dangling pointer.

## Consequences

Our divergence from upstream is a single, reviewable delta rather than nine files nobody here has the context to maintain. `npx skills update` has open bugs that pull a whole source rather than a named skill, so the edited skill must be re-checked after any update. The MIT notice ships with the repo.
