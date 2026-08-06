# No architecture overview in the instruction file

`AGENTS.md` carries a routing table — `Task | Where to look | Notes` — instead of an architecture or project-structure section. No file tree, no dependency list, no prose describing how the layers relate.

This deviates from near-universal practice: nineteen of nineteen surveyed real-world instruction files open with an overview. We deviate because the controlled evidence separates the two — instructions are followed, repository overviews are not — and Anthropic's own tooling deletes directory layouts and architecture overviews while keeping pitfalls, rationale and conventions that differ from tool defaults.

## Consequences

The rule both sources agree on is *document only what the agent cannot derive by looking*. Prose describing the architecture fails that test; a routing table passes it, because which of six plausible directories a change belongs in is a team habit, not something readable from the code. Note honestly that routing tables have not themselves been measured against overviews — this is reasoning from the shared rule, not a replicated result. Anyone who later measures otherwise should supersede this record.
