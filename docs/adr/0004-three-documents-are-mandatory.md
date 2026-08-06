# Three documents are mandatory in every repository

Every repository carries `AGENTS.md`, `CONTEXT.md` and `docs/adr/`. This applies to existing repositories, not only new ones.

We mandate them knowing the evidence is uncomfortable: a controlled evaluation found instruction files do not generally improve task success rates while costing roughly 20% more inference, and wrong documentation measured *worse than no documentation at all*. What makes the mandate defensible is that we are not asking anyone to write documentation — grilling produces the glossary and the decision records as exhaust from a conversation the engineer wanted to have anyway.

## Consequences

The mandate is only net-positive if the documents stay true, so it is inseparable from the hygiene rule in ADR-0005. If we ever observe these files going stale in practice, the correct response is to fix the hygiene loop or drop the mandate — not to keep mandating documents nobody trusts, which is the worst measured configuration.
