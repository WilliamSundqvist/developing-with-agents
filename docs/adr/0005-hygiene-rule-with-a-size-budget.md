# The instruction file carries its own hygiene rule

`AGENTS.md` contains a clause governing its own growth: a size budget of roughly 250 lines; a rule is added only after the same mistake has happened **twice**; and the documents are reviewed in the pull request that changes the behaviour they describe.

Agent instruction files grow monotonically — the median observed deletion is about fifteen words — and bloat is the failure mode every vendor names. A size budget is the only mechanism that converts "should we add this?" from a free action into a trade where something must come out.

## Consequences

The counterintuitive corollary is stated in the file itself: when an agent ignores an instruction, suspect the file's length before its phrasing. Automated auditing of the documents against the code was considered and deferred — an audit needs a stable target, which we will not have until the standard has been running for a while. The `audit-docs` skill covers this manually in the meantime.
