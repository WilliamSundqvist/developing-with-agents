# One instruction file, reached by a stub

Real content lives in `AGENTS.md`. `CLAUDE.md` contains only `@AGENTS.md`, because Claude Code does not read `AGENTS.md` natively. We deliberately ship **no** `.github/copilot-instructions.md`.

VS Code reads `AGENTS.md` and `.github/copilot-instructions.md` and *combines* them with no guaranteed ordering. A second instruction file is therefore not redundancy but a second source of truth that will drift, and when the two disagree the agent receives contradictory instructions with no rule for which wins.

## Consequences

Updating the standard is a one-file edit, which matters because the file will be edited by people not thinking about four runtimes. We use a stub file rather than a symlink: when `core.symlinks` is false the link is checked out as a small plain text file containing the link path — a silent failure on Windows, where most of our engineers work. Nested `AGENTS.md` for monorepos is experimental and off by default in VS Code, so sub-project instruction files are not yet reliable.
