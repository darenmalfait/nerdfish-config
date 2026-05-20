# Testing rule fixtures

Valid examples for `@nerdfish/config/eslint/testing` and
`@nerdfish/config/eslint/testing/bdd`. CI fails if rules regress and these no
longer pass.

Supports Jest/Vitest (`describe` / `it` / `test`) and Playwright (`test` /
`test.describe` / `test.beforeEach` with `{ page }` fixtures).

| Fixture | Runtime stub |
| --- | --- |
| `__tests__/*.test.tsx` | `testing-runtime.ts` (RTL-style `render`, `screen`) |
| `__tests__/e2e/*.test.ts` | `e2e/playwright-runtime.ts` (`page`, `expect().toBeVisible()`) |

No real test runner in this repo — files exist so ESLint can parse valid patterns.

## Commands

```bash
pnpm lint
pnpm test:eslint-rules
```
