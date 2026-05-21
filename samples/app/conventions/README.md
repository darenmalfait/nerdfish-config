# Conventions rule fixtures

Valid examples for `@nerdfish/config/eslint/conventions`. CI fails if rules regress
and these no longer pass.

| Fixture | Rule |
| --- | --- |
| `map-transformer-name.ts` | `map-transformer-name` — named `.map()` callbacks start with `to` |
| `sort-transformer-name.ts` | `sort-transformer-name` — named `.sort()` comparators start with `by` |
| `event-handler-name.tsx` | `event-handler-name` — named JSX `on*` handlers start with `handle` |
| `boolean-name.ts` | `boolean-name` — boolean locals start with `is` or `has` |

```bash
pnpm lint
```
