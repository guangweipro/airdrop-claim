# Support

**This project is a template, not a product.** It is maintained by one person in
their own time.

## What you can expect

| | |
|---|---|
| Bug reports on GitHub | Read. Fixed when they affect the maintainer's own deployment or are clearly security-relevant. |
| Feature requests | Read. Usually declined — fork instead. |
| Guaranteed response time | **None.** |
| Help deploying your own instance | **Not provided here.** |
| Security reports | See [`SECURITY.md`](SECURITY.md) — these are prioritised. |

## Before opening an issue

1. Read [`README.md`](README.md), [`AGENTS.md`](AGENTS.md) and the design docs
   under `docs/`.
2. Run the gate suite and include the exact commands and output:
   ```bash
   pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```
3. Say what you expected, what happened, and how to reproduce it.

Issues that are actually deployment questions, or that report behaviour the
design docs describe as intentional, will be closed with a pointer to the docs.

## What is never supported

Requests to add payment collection, presale mechanics, fabricated statistics, or
anything else that violates the architecture invariants in [`AGENTS.md`](AGENTS.md).
These are not a matter of opinion — they are the reason the project exists in
this shape.
