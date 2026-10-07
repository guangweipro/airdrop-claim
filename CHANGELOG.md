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
