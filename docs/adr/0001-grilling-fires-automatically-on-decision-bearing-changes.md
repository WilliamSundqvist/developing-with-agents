# Grilling fires automatically on decision-bearing changes

Running `grill-with-docs` is what produces our glossary and decision records, so we cannot leave it to the engineer remembering to type it. The instruction file therefore tells the agent to announce and start a grilling session whenever a request is a **decision-bearing change** — a new module seam, dependency, schema, external contract, agent behaviour, or product rule — and to proceed directly for everything else.

## Considered Options

- **Model judgement** ("grill when the request warrants it") — rejected: an unobservable trigger fires inconsistently and nobody can predict it.
- **Size or risk heuristics** (file count, touched directories) — rejected: wrong in both directions, since a one-line change can set a precedent and a 40-file rename decides nothing.
- **A closed list of triggering conditions** — chosen: it is a property of the *change*, checkable in one pass, and it is the same test the ADR criteria already use, so trigger and artifact stay aligned.

## Consequences

The agent announces which clause fired before it starts, so the rule teaches itself every time it runs. The engineer can decline and get code immediately; the escape holds for that request only. Refusing to write code until grilling completes was rejected — an agent that blocks produces workarounds, and a workaround teaches people to route around the standard entirely.
