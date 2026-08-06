# Agentic Development Standard

The company standard for making a codebase one that coding agents can work in: the instruction file, the glossary, the decision records, and the skills that keep all three current. This glossary describes the standard itself — a project adopting the standard keeps its own `CONTEXT.md` describing its own domain.

## Language

**Decision-bearing change**:
A change that adds or alters a design decision — a new module seam, a new dependency, a schema or data-shape change, an external contract, agent behaviour, or a product rule. The condition that fires grilling.
_Avoid_: significant change, major change, fitting prompt

**Mechanical change**:
Any change that decides nothing — a rename, a typo, a dependency bump, fixing a failing test, applying a pattern the codebase already uses. Proceeds with no ceremony.
_Avoid_: trivial change, small change

**Grilling**:
A relentless one-question-at-a-time interview that walks the design tree, resolving one decision per turn, with a recommendation attached to every question.
_Avoid_: planning session, brainstorming, discovery

**Exhaust**:
Documentation produced as a by-product of a conversation someone wanted to have anyway. The glossary and the decision records are exhaust from grilling — never homework assigned separately.
_Avoid_: documentation task, write-up

**Worked example**:
A complete, realistic document for a fictional project, carrying the `.example` suffix so no agent loads it. Shows density, tone and length; is never the source of a real project's facts.
_Avoid_: template, skeleton, boilerplate, scaffold

**Company layer**:
The skills this organisation owns and maintains, as distinct from the skills forked from upstream. Currently `onboard` and `audit-docs`.
_Avoid_: custom skills, our skills

**Surgical fork**:
Taking ownership of upstream skills while hand-editing only what the design requires, leaving every other file byte-identical so upstream updates stay usable.
_Avoid_: vendoring, copying

**Onboarding**:
The two-phase run of the `onboard` skill against an existing codebase: verify everything derivable by executing it, then interview the human on what could not be derived.
_Avoid_: init, bootstrap, setup

**Routing table**:
The `Task | Where to look | Notes` section of the instruction file. Encodes which directory a kind of change belongs in — the thing an agent cannot derive by reading code.
_Avoid_: architecture overview, project structure, file tree

**Check command**:
The single command a repo exposes that runs typecheck, lint and tests and exits non-zero on failure. The Definition of Done is that it passes.
_Avoid_: test script, build step, CI pipeline

**Hygiene rule**:
The three-part clause that stops the instruction file growing without bound: a size budget, a rule enters only after the same mistake happens twice, and docs are reviewed in the pull request that changes the behaviour they describe.
_Avoid_: maintenance policy, doc review

**Context pointer**:
A reference held in the agent's context that names out-of-context material and encodes the condition for reaching it — a skill's `description`, or a line in the instruction file naming a document. Its wording, not its target, decides how reliably the material is reached.
_Avoid_: link, reference, mention
