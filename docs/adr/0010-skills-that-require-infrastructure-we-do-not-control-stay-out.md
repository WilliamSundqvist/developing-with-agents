# Skills requiring infrastructure we do not control stay out

We take eleven skills, not the whole of [mattpocock/skills](https://github.com/mattpocock/skills). Two rules decide what comes across.

**Nothing that requires changing infrastructure the adopting team does not control.** Ticket systems are imposed by employers; a developer cannot swap theirs on a Tuesday. So the ticket and spec workflows (`to-tickets`, `to-spec`, `triage`, and `wayfinder`, which is built on them) stay out however good they are. The promise of this standard is that one developer can adopt it this afternoon, alone, without asking anyone's permission — a skill that breaks that promise costs more than it adds.

**Skill count is a budget.** Measured pass rates fall 8–21% as libraries grow to 52–202 skills, through *shadowing* — skills competing to match a request — rather than token cost. Every addition makes the skills we depend on fire less reliably.

## Consequences

Adding a skill means naming which existing skill it now competes with for attention. Skills that neither touch external infrastructure nor duplicate one already here — `code-review` and `diagnosing-bugs` are the obvious candidates — are eligible on the first rule and still have to earn their place against the second.

This rule is about the *company standard*, not about individuals: anyone is free to install more skills in their own workspace. What ships to every repository is what stays scarce.
