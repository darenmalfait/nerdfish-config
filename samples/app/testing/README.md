# Testing rule fixtures

Valid examples for `@nerdfish/config/eslint/testing`. CI fails if rules regress and these no longer pass.

Supports Jest/Vitest (`describe` / `it` / `test`) and Playwright (`test` / `test.describe` / `test.beforeAll`).

Fixtures import stubs from `__tests__/testing-runtime.ts` (no real test runner in this repo).

## Commands

```bash
pnpm lint
pnpm test:eslint-rules
```
