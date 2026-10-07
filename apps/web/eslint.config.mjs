/**
 * Copyright 2026 Davey <wgwcko@gmail.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["dist", "build", "coverage", "node_modules", ".next", ".open-next", "next-env.d.ts"],
  },
  {
    files: ["**/*.{ts,tsx,mjs}"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        // `allowJs: false` in tsconfig means .mjs config files cannot belong to
        // the TS project, so the project service would refuse to parse them.
        // allowDefaultProject lets those files be linted outside the project.
        projectService: {
          allowDefaultProject: ["*.config.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
    },
  },
  {
    // Next.js App Router files legitimately export non-components from page
    // modules: `metadata`, `generateMetadata`, `dynamic`, and route handlers.
    // The fast-refresh heuristic does not apply to them.
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  prettier,
]);
