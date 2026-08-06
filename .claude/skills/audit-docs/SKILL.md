---
name: audit-docs
description: Check AGENTS.md, CONTEXT.md and docs/adr/ against the code and against each other, and report the drift. Use before onboarding someone new, after an agent has contradicted the docs, or after a refactor large enough to move vocabulary.
disable-model-invocation: true
---

# Audit Docs

Find where this repository's three documents have come loose from the code, and from each other.

Drift is correlated: rename a domain term and you invalidate a glossary entry, the ADRs that use the old word, and any `AGENTS.md` line naming it. So audit all three together — auditing one reports the symptom and misses the cause.

Wrong documentation measures **worse than absent** documentation. A confident, stale line is not a small problem to tidy up later; it is actively worse than deleting it. Treat every finding as a live defect.

## The four checks

Run all four. Report every finding with the file and line it came from, and the evidence that contradicts it.

**1. ADRs against reality.** For each record in `docs/adr/`, does the code still do what it says? Check the specific mechanism, not the vibe — an ADR that says "communication is via domain events" is refuted by one synchronous call. Where the code has moved on, propose a **new** ADR that supersedes the old one and add `superseded by ADR-NNNN` to the original.

**2. ADRs against each other.** Two records that decide the same question differently, or one that silently assumes another was reversed. Sequence matters: the later one usually wins, but say so explicitly rather than leaving the reader to date them.

**3. Decisions with no record.** Look for choices in the code that meet all three ADR conditions — hard to reverse, surprising without context, the result of a real trade-off — and have no record at all. Report them as *candidates for a grilling session*. Do not write the ADR: you would be inventing the rationale, and the rationale is the entire value of the record.

**4. Glossary drift.** Terms in `CONTEXT.md` that no longer appear in the code, and domain vocabulary in the code with no glossary entry. Also the sharper case: a term whose meaning has shifted while its name stayed put — that one reads as agreement and behaves as a contradiction.

Then check `AGENTS.md` against its own hygiene rule: over the size budget, commands that no longer run, rules a linter now enforces, and anything that has become derivable.

## What you produce

A report, ordered by how much damage each finding does if believed. For each: the claim, the evidence against it, and the smallest fix.

You may write superseding ADRs and correct `AGENTS.md` and `CONTEXT.md` once the human agrees to specific findings.

**Never edit an existing ADR's decision or rationale.** A record that no longer matches reality is not a mistake to correct — it is the true statement of what was believed then. Supersede it. Editing the trail destroys the only thing the records are for.

Where a finding needs a decision rather than a correction, hand it to `/grill-with-docs` instead of resolving it yourself.
