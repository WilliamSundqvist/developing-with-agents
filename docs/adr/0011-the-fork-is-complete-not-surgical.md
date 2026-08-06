# The fork is complete, not surgical

Supersedes [ADR-0002](0002-surgical-fork-of-upstream-skills.md).

We own all seven skills outright and have deleted `skills-lock.json`. There is no upstream update path.

The lock file made the standard undeliverable. The `skills` CLI treats a locked skill as belonging to its recorded source and refuses to re-export it, so `npx skills add <org>/<repo>` against this repository found **two** skills instead of seven — everything except `onboard` and `audit-docs`. Confirmed by controlled test: identical tree, lock present → 2 found; lock removed → 7 found. Teams could not reach `grill-with-docs`, which is the entire working habit.

The alternative was to tell each team to install from both sources. That delivers *upstream* `grill-with-docs`, without the auto-fire trigger, which is worse than the bug: the habit fails silently and looks installed.

## Consequences

`npx skills update` no longer applies, and in practice it was never a benefit. It reverted our one edit and re-symlinked the tree; we built `skills:flatten` and two `check` rules to fight it. We now carry the maintenance of seven files, which is the honest cost of a fork and was always the direction ([Q10](0002-surgical-fork-of-upstream-skills.md)).

Attribution is unaffected. [`NOTICE`](../../NOTICE) carries the MIT licence and names the derived files, which is what the licence requires — the lock file was never the mechanism for that.

Upstream improvements now arrive by someone reading [mattpocock/skills](https://github.com/mattpocock/skills) and porting what is worth having. That is a deliberate act with a diff to review, rather than a command that silently overwrites edits nobody remembers making.
