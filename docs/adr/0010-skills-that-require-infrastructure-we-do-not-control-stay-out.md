# Only skills that make a repository legible

We take seven skills, not the whole of [mattpocock/skills](https://github.com/mattpocock/skills). Three rules decide what comes across.

**Nothing that requires changing infrastructure the adopting team does not control.** Ticket systems are imposed by employers; a developer cannot swap theirs on a Tuesday. So the ticket and spec workflows (`to-tickets`, `to-spec`, `triage`, and `wayfinder`, which is built on them) stay out however good they are. The promise of this standard is that one developer can adopt it this afternoon, alone, without asking anyone's permission — a skill that breaks that promise costs more than it adds.

**Nothing that decides how a team builds.** `tdd`, `code-review` and `diagnosing-bugs` are all eligible on the first rule and still stay out: whether a team works test-first, how it reviews, how it debugs are that team's decisions. Shipping them company-wide would smuggle a development methodology in under a documentation standard.

**Skill count is a budget.** Measured pass rates fall 8–21% as libraries grow to 52–202 skills, through *shadowing* — skills competing to match a request — rather than token cost.

## Consequences

Four skills were installed and then removed, which is these rules working rather than a reversal: `wayfinder` (rule one); `improve-codebase-architecture` and `codebase-design` (rule two — they improve the code rather than making the repository legible, and the first was the heaviest thing in the set); and `grill-me` (grilling without the documents, an exit from the mechanism [ADR-0004](0004-three-documents-are-mandatory.md) depends on). `wait-what` went for scope: it repairs a conversation, and leaves nothing durable in the repository.

Adding a skill means naming which of the seven it competes with for attention. This governs the *company standard*, not individuals: anyone may install what they like in their own workspace. What ships to every repository is what stays scarce.
