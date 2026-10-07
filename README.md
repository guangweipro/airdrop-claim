# airdrop-claim

A verifiable airdrop claim system: X identity + SIWE wallet proof + on-chain payout.

[![CI](https://github.com/guangweipro/airdrop-claim/actions/workflows/ci.yml/badge.svg)](https://github.com/guangweipro/airdrop-claim/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

> **This is a template, not a product.** Fork it and adapt it — that is the
> intended use. Issues are read, but a response is not guaranteed.
> See [SUPPORT.md](SUPPORT.md).

> **Status: early.** Only the repository skeleton exists so far. The claim flow,
> the token contract and the payout runner are not implemented yet.
> The milestone plan is in [docs/05](docs/05-里程碑与验收.md).

---

## Why this exists

Most airdrop pages are built to look like something is happening. Fabricated
progress bars, invented purchase tickers, a wallet address that collects funds
with no contract behind it, and an "airdrop" that records nothing when you
submit. The chain makes all of that trivially detectable after the fact.

This project takes the parts of that pattern that genuinely work — a public
action that people want to take — and implements them honestly. Delivery is
real. Every claim is recorded. Every payout has a transaction hash that anyone
can check.

---

## What this is **not** — enforced by construction

The system is built around five invariants. They are not guidelines and not
configurable. A change that weakens one will not be accepted — see
[docs/ADR/0003](docs/ADR/0003-开源与私有边界.md) and [AGENTS.md](AGENTS.md).

| # | Invariant | Consequence |
|---|---|---|
| **I1** | **The system contains no payment collection.** No presale, no deposits, no fund aggregation. | It cannot be used to take money from anyone. |
| **I2** | **No configurable fake-display components.** No fabricated progress bar, no invented purchase ticker. | Faking activity requires writing a new module, not flipping a flag. |
| **I3** | **All public statistics are queried live from the database.** | There is nowhere to hardcode a number. |
| **I4** | **Every payout records its transaction hash, with a public export.** | Claiming delivery requires delivering. |
| **I5** | **SIWE signature verification cannot be disabled.** | There is no low-effort path that skips proving the wallet. |

I1 is the load-bearing one: **a system that cannot accept money cannot become a
rug pull.** That is as much a protection for whoever runs it as for the people
who claim.

---

## Architecture

```
Browser
  ├─ X OAuth 2.0 PKCE ──→ identity only (1 account = 1 claim)
  ├─ wagmi/viem + SIWE ──→ proves wallet ownership
  └─ POST /api/claim/submit
          │
          ▼
   Next.js on Cloudflare Workers/Pages   ← never holds a private key
     ├─ verify SIWE (single-use nonce, domain-bound, 5 min TTL)
     ├─ deduplicate (x_user_id unique, wallet unique)
     ├─ enforce caps (total / per-IP / window / kill switch)
     └─ write claim as PENDING            ← nothing is paid out here
          │
          ▼  (delayed, batched; abuse window before any money moves)
   payout runner — runs locally, the only holder of the signing key
     ├─ take unlocked, due tranches from Postgres
     ├─ build tx → policy check → budget guard → sign → broadcast
     └─ reconcile by nonce + receipt, then write status = PAID
```

**Deployment rationale:** [ADR-0002](docs/ADR/0002-托管与部署方案.md).
**Chain choice:** [ADR-0001](docs/ADR/0001-为什么选-BSC-而非-Solana.md).

Two design decisions worth knowing up front:

- **Claiming is not paying.** A claim is only recorded. Payouts are delayed and
  batched, which creates a window to cancel abuse before any funds move — and
  removes the need for an always-on payout daemon at pilot scale.
- **The web process never holds the key.** Signing happens in a separate runner
  on a separate machine.

---

## Quick start

Requirements: Node 22+, pnpm 11+, Docker (for the local database only).

```bash
pnpm install

# Enable the secret-scanning pre-push hook (once per clone).
git config core.hooksPath .githooks

docker compose up -d postgres
cp .env.example .env      # then fill it in; ADMIN_ENABLED=false is the default

pnpm --filter @airdrop-claim/web db:migrate
pnpm --filter @airdrop-claim/web dev
```

The app boots into an inert state by default: `ADMIN_ENABLED=false`, no token
contract configured, `PAYOUTS_PAUSED=true`. Nothing on-chain can happen by
accident.

### Quality gates

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
gitleaks dir . --config .gitleaks.toml
```

All of these must pass before a change is considered done.

---

## Documentation

| Document | Contents |
|---|---|
| [01 · Technical design](docs/01-技术方案.md) | Architecture, invariants, data model, API, payout runner, security controls |
| [03 · Cost model](docs/03-成本与预算.md) | What an airdrop actually costs, per chain |
| [04 · Risk and compliance](docs/04-风险与合规.md) | Legal boundaries, privacy, continuity, abuse risk |
| [05 · Milestones](docs/05-里程碑与验收.md) | M0–M11, each with testable acceptance criteria |
| [08 · Open-source checklist](docs/08-开源发布检查单.md) | What must be true before publishing |
| [ADR-0001](docs/ADR/0001-为什么选-BSC-而非-Solana.md) | Chain selection, with measured cost data |
| [ADR-0002](docs/ADR/0002-托管与部署方案.md) | Hosting and where the signing key lives |
| [ADR-0003](docs/ADR/0003-开源与私有边界.md) | Why this is open source, and the five invariants |

The design documents are written in Chinese. English translations are welcome.

---

## Contributing

Forking is the expected path. Pull requests are welcome for bug fixes,
hardening, documentation corrections and tests — see
[CONTRIBUTING.md](CONTRIBUTING.md).

Please read [AGENTS.md](AGENTS.md) first: it lists the invariants and the
security rules, and a change that weakens any of them will be rejected.

## Security

See [SECURITY.md](SECURITY.md). Do not open a public issue for a vulnerability.

## License

Apache-2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).

Copyright 2026 Davey <wgwcko@gmail.com>
