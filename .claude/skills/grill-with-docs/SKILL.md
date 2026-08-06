---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADRs and glossary) as we go. Use BEFORE building any new feature or making a change that adds or alters a design decision (new seam, dependency, schema, external contract, agent behaviour, or product rule), so docs/adr/ and CONTEXT.md stay current. Skip only for mechanical fixes that decide nothing.
---

Run a `/grilling` session, using the `/domain-modeling` skill.

When you reached this skill yourself rather than by the user typing it, open with one line naming the decision the request carries — "this adds a dependency, so grilling first" — then ask the first question. If the user would rather get on with it, drop the grilling for that request and build.
