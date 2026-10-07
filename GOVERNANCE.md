# Governance

## Model

Benevolent dictator. **@weinotes** is the sole maintainer and has final say on
every change.

## Decision making

Significant technical decisions are recorded as ADRs in `docs/ADR/`. An ADR states
the decision, the reasoning, the alternatives that were rejected and why, and the
consequences — including the negative ones.

Changes that would alter an accepted ADR require a new ADR that supersedes it.
The old one is not edited; its status changes to `Superseded by ADR-NNNN`.

## Non-negotiable constraints

The architecture invariants **I1–I5** in [`AGENTS.md`](AGENTS.md) are outside the
normal decision process. They exist because this system is published as a
template that other people will run. A change that weakens them will not be
accepted from anyone, including the maintainer, without first amending ADR-0003
in public.

## Contributions

This repository is primarily a **template**. Forking is the expected way to adapt
it. Pull requests are accepted for bug fixes, hardening, documentation
corrections and tests — see [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Releases

Semantic versioning. Tags are signed and immutable: a published tag is never
moved or overwritten. Release notes, SHA256 checksums and an SBOM accompany each
release.

## Security

See [`SECURITY.md`](SECURITY.md). Vulnerabilities are handled privately until a
fix is available.

## If this project is abandoned

It will be **archived**, and the README will say so plainly at the top, along with
any known alternatives. An unmaintained project that pretends to be maintained is
worse than an archived one.
