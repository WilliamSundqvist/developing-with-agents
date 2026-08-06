<!--
  WORKED EXAMPLE — not loaded by any agent, and not about this repository.
  Depot is a fictional order-intake API. Read this for shape, density and length;
  never copy its facts. Your own AGENTS.md is written by `/onboard` from your code.
-->

# Depot

Order intake API. HTTP in, Postgres, a worker that dispatches accepted orders to the carrier.

## Commands

| | |
|---|---|
| `pnpm check` | **Definition of Done.** Typecheck, lint, tests. Must exit 0. |
| `pnpm dev` | API on :3000 and the worker together. Needs Docker running. |
| `pnpm test path/to/file.test.ts` | Single file. Whole-suite runs take 4 minutes; don't run them to check one thing. |
| `pnpm db:migrate` | Applies pending migrations to your local database. |
| `pnpm db:reset` | Drops and reseeds. The only way to recover from a half-applied migration. |

Docker must be up before anything touches the database. `pnpm dev` fails with a connection refused that reads like a code error but isn't.

## Where to look

| Task | Where | Notes |
|---|---|---|
| Add or change an endpoint | `src/http/routes/` | Route file, then a handler in `src/orders/`. Routes hold no logic. |
| Business rule | `src/orders/` | Everything that decides *whether* something may happen lives here. |
| Database change | `src/db/migrations/` | Migration first, then the type in `src/db/schema.ts`. Never edit an applied migration. |
| Carrier integration | `src/carriers/` | One directory per carrier, each behind `CarrierClient`. |
| Background work | `src/worker/handlers/` | Register in `src/worker/index.ts` or it silently never runs. |
| Anything shared by two of the above | Don't | Put it in the one that owns it and import. `src/shared/` is being deleted. |

## Deviations from the defaults

- **No ORM.** Hand-written SQL through `src/db/query.ts`. This is deliberate — see [ADR-0004](docs/adr/0004-no-orm.md) — and reintroducing one has been proposed and rejected twice.
- **Errors are returned, not thrown**, across `src/orders/`. Handlers return `Result<T, OrderError>`. Throwing works and will pass review by mistake; it breaks the retry classification in the worker.
- **Tests hit a real Postgres**, one schema per worker, no mocking of the database. Mocked repository tests are not accepted here — they passed for months while the SQL was wrong.
- **`any` is banned by lint**, including in tests. `unknown` plus a narrow is the expected move.

## Gotchas

- `OrderStatus` exists in two places: the Postgres enum and the TypeScript union. Changing one without the other typechecks fine and fails in production. `pnpm check` catches it; nothing in your editor will.
- The worker polls every 5 seconds. Integration tests that assert on dispatch need `advanceDispatch()` from `test/helpers`, not a sleep.
- `CARRIER_API_KEY` is absent in CI on purpose. Carrier tests are skipped there and run nightly.
- Timestamps are stored UTC and rendered in the customer's timezone at the edge only. A `Date` anywhere inside `src/orders/` is UTC. Always.

## Before you build

A change that adds or alters a design decision — a new module seam, a new dependency, a schema change, an external contract, agent behaviour, or a product rule — starts with `/grill-with-docs`, which produces the ADR and any glossary entries as a by-product. Say so, then start; if I'd rather get on with it, I'll say so.

Mechanical work — renames, typos, dependency bumps, fixing a failing test, applying a pattern that already exists here — just gets done.

## Definition of Done

`pnpm check` exits 0. That is the whole bar, and it is not negotiable by argument — if the check is wrong, fix the check.

## Rules hygiene

This file is capped at **250 lines**. Adding something means deciding what comes out.

A rule earns a place here only after the same mistake has happened **twice**. Once is a coincidence.

When an agent ignores an instruction in this file, suspect the file's **length** before its phrasing.

Anything derivable by reading the code does not belong here — no architecture overview, no directory tree, no dependency list. This file is for what the code cannot say.

Docs are reviewed in the pull request that changes the behaviour they describe, not in a separate cleanup that never happens.
