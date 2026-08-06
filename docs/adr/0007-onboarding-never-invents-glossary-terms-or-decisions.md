# Onboarding verifies, interviews, and never invents

The `onboard` skill runs in two phases. First it verifies everything derivable from the repository — including **executing** the build, test and lint commands rather than copying them out of a README — and grounds every stated convention in a file path it actually read. Then it interviews the human about what it demonstrably could not derive, and writes anything still unresolved into an explicit open-questions section rather than filling the gap.

It is forbidden two specific outputs: a generated glossary and backfilled decision records. Auto-generated glossaries launder naming debt, canonising whatever names happen to be in the code as domain language — the opposite of a glossary's purpose. Retroactive decision records inferred from git history invent rationale; the state of the art deliberately refuses to infer "why" from code and retrieves it from linked discussions instead.

## Consequences

`CONTEXT.md` and `docs/adr/` therefore start close to empty and fill up through grilling. That is the intended shape: a decision record can only ever be exhaust from a real conversation. Onboarding a repository costs a human roughly twenty to thirty minutes of answering questions, which we accept over a fire-and-forget command that produces confident filler — fluency suppresses review, so plausible-sounding invented conventions are harder to catch than missing ones.
