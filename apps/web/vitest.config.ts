/**
 * Copyright 2026 Davey <wgwcko@gmail.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Chain tests live in test/chain and are deliberately excluded: they need a
    // funded testnet key and must never run in CI (docs/01-技术方案.md §12).
    include: ["test/unit/**/*.test.ts", "test/integration/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
    },
  },
});
