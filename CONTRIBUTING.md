# Contributing

Thanks for looking. **This repository is primarily a template** — the most useful
thing you can do with it is fork it and adapt it, rather than send a pull request.

## Before you open a PR

Please read [`AGENTS.md`](AGENTS.md) first. It lists the architecture invariants
(I1–I5) that this project exists to uphold. A change that weakens any of them will
be rejected regardless of how useful it otherwise is.

## What is welcome

- Bug fixes, especially anything touching the payout path, reconciliation, or
  the nonce handling.
- Corrections to the documentation where it disagrees with the code.
- Hardening: anything that makes a failure mode louder or a secret less likely
  to leak.
- Additional tests, particularly invariant tests.

## What is out of scope

- **Anything that would let the system accept money.** See invariant I1.
- Features that make the system easier to misrepresent: fake progress bars,
  fabricated purchase tickers, configurable "display" numbers that diverge from
  the database.
- Admin conveniences that turn into attack surface (password auth, role systems,
  self-service wallet changes).
- Adding a new chain or a DEX integration without an accepted ADR.

## Development

```bash
pnpm install
docker compose up -d postgres
pnpm --filter @airdrop-claim/web dev
```

## Before submitting

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
gitleaks dir . --config .gitleaks.toml
```

All of these must pass. Do not describe a change as working without pasting the
commands you ran and their output.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`,
`refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `revert`.
Atomic commits — one logical change each.

## Response expectations

This is maintained by one person. Issues and pull requests may not get a reply.
For anything you need a guaranteed answer on, get in touch directly.
