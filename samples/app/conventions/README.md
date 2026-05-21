# Conventions rule fixtures

Valid examples for `@nerdfish/config/eslint/conventions`. CI fails if rules regress
and these no longer pass.

| Fixture | Rule |
| --- | --- |
| `map-transformer-name.ts` | `map-transformer-name` — named `.map()` callbacks start with `to` |

```bash
pnpm lint
```
