---
name: audit-docs
description: Report where AGENTS.md, CONTEXT.md and docs/adr/ have come loose from the code and from each other.
disable-model-invocation: true
---

# Audit Docs

Find the **drift** between this repository's three documents and its code.

Audit all three together. Drift is correlated: rename a domain term and you invalidate a glossary entry, every ADR that uses the old word, and any `AGENTS.md` line naming it. Auditing one reports the symptom and misses the cause.

Treat every finding as a live defect. Wrong documentation measures *worse than absent* documentation — a confident stale line is not tidying-up owed later.

## The four checks

Run all four. Report each finding with the file and line it came from, and the evidence that contradicts it.

**1. Records against reality.** For each ADR, does the code still do what it says? Check the mechanism, not the vibe — "communication is via domain events" is refuted by one synchronous call. Where the code has moved on, propose a **new** record that supersedes the old one, and mark the original `superseded by ADR-NNNN`.

**2. Records against each other.** Two that decide the same question differently, or one that silently assumes another was reversed. The later usually wins — say so explicitly rather than leaving the reader to date them.

**3. Decisions with no record.** Choices in the code meeting all three ADR conditions — hard to reverse, surprising without context, the result of a real trade-off — with nothing written down. Report these as candidates for a grilling session; the rationale is the whole value of a record, and only the human has it.

**4. Glossary drift.** `CONTEXT.md` terms absent from the code, and domain vocabulary in the code with no entry. Then the sharper case: a term whose meaning moved while its name stayed put. That one reads as agreement and behaves as a contradiction.

Then hold `AGENTS.md` to its own hygiene rule: over the line budget, commands that no longer run, rules a linter now enforces, anything that has become derivable.

## What you produce

A report ordered by how much damage each finding does if believed. For each: the claim, the evidence against it, the smallest fix.

Once the human agrees to specific findings, write the superseding records and correct `AGENTS.md` and `CONTEXT.md`.

**Supersede records; leave their text alone.** An ADR that no longer matches reality is still the true statement of what was believed then, and that trail is the only thing the records are for.

Where a finding needs a decision rather than a correction, hand it to `/grill-with-docs`.
