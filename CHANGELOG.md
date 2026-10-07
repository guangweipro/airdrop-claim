# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- M0: pnpm workspace skeleton (`apps/web` for the Next.js app, `contracts` reserved for Hardhat).
- M0: CI gate (format, lint, typecheck, test, build) plus a full-history secret scan.
- M0: Gitleaks rules covering EVM private keys, keystore JSON, raw keypair arrays,
  X API client secrets and BSCScan keys — verified to fire against planted fixtures.
- M0: `normalizeAddress` helper with tests, enforcing the lowercase-address invariant
  that makes "one wallet = one claim" enforceable.
- M0: a `pre-push` hook that scans the outgoing commit range and refuses the push.
  It runs earlier than server-side push protection: the secret never leaves the
  machine. Enable with `git config core.hooksPath .githooks`.
- M0: design documents (`docs/01`–`08`, ADRs `0001`–`0003`) and governance files.

### Changed

- M0: CodeQL is guarded on repository visibility, so it is a no-op while the
  repository is private (code scanning there requires GitHub Advanced Security)
  and activates automatically once public. Semgrep runs in CI in the meantime.
- M0: `dependabot.yml` reduced to the ecosystems this repository actually has
  (github-actions, npm). Minor and patch npm updates are grouped; major updates
  are left ungrouped so each is read individually.
- M0: transitive dependencies `ws`, `ansi-regex` and `mysql2` pinned to patched
  versions within their current major. Overrides live in `pnpm-workspace.yaml`:
  pnpm 11 no longer reads `pnpm.overrides` from `package.json`.

### Security

- Branch protection on `main`: pull request required, three required status
  checks, linear history, force pushes and deletions blocked, and administrators
  are subject to the same rules. Required approvals is set to 0 deliberately —
  a solo maintainer cannot approve their own pull request, and a rule that can
  never be satisfied is not a control. The automated checks are the independent
  gate. Raise it to 1 as soon as a second maintainer exists.
- Secret scanning and push protection enabled on the repository.
