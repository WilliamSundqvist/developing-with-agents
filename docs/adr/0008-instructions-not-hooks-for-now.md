# Enforcement is instructional, with hooks held in reserve

The grilling trigger from ADR-0001 lives in `AGENTS.md` as prose, not in a hook. The repository ships a ready-made `UserPromptSubmit` reminder hook, switched off, with instructions for enabling it.

We know what this costs. Instruction files are advisory and measurably so: the best observed strict compliance with binding policy documents was around 36%, most frontier models under 25%, and adherence decays further as a session goes on. We accept a one-in-three mechanism because VS Code hooks are still Preview and almost everyone here is on Copilot — and a standard whose first experience is a half-working hook gets written off before anyone reads the good parts.

## Consequences

A reminder hook would also duplicate the rule across two files, so the day someone edits one and not the other the agent is told two things. Revisit this once VS Code hooks leave Preview, or sooner if we observe the trigger being missed in practice; the switch is a settings change, not a redesign. Anything that must *always* happen — as opposed to should usually happen — belongs in a hook, a pre-commit gate or a lint rule from the start, never in prose.
