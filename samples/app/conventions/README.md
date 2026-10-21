# Conventions rule fixtures

Valid examples for `@nerdfish/config/eslint/conventions`. CI fails if rules regress
and these no longer pass.

| Fixture | Rule |
| --- | --- |
| `map-transformer-name.ts` | `map-transformer-name` — named `.map()` / `.flatMap()` / `Array.from()` callbacks start with `to` |
| `sort-transformer-name.ts` | `sort-transformer-name` — named `.sort()` / `.toSorted()` comparators start with `by` |
| `event-handler-name.tsx` | `event-handler-name` — named JSX `on*` handlers start with `handle` |
| `boolean-name.ts` | `boolean-name` — boolean locals start with `is` or `has` |
| `no-static-render-prop.tsx` | `no-static-render-prop` — `render*` props must take arguments; static structure goes in children |
| `narrow-effect-deps.tsx` | `narrow-effect-deps` — effect deps list the properties read, not the whole object |
| `no-callback-only-subscription.tsx` | `no-callback-only-subscription` — no `useSearchParams()` (configurable) read only in event handlers |
| `prefer-use-transition.tsx` | `prefer-use-transition` — `useTransition` instead of `setLoading(true)` … `await` … `setLoading(false)` |
| `no-dynamic-import-path.ts` | `no-dynamic-import-path` — `import()` takes a static string path |
| `no-trivial-use-memo.tsx` | `no-trivial-use-memo` — no `useMemo` around call-free, allocation-free expressions |
| `prefer-flat-map-over-map-filter.ts` | `prefer-flat-map-over-map-filter` — `.flatMap()` instead of `.map(…).filter(Boolean)` |
| `prefer-functional-set-state.tsx` | `prefer-functional-set-state` — updater form when next state reads current state |
| `require-passive-event-listener.ts` | `require-passive-event-listener` — scroll/wheel/touch listeners state `passive` explicitly |
| `require-script-loading-strategy.tsx` | `require-script-loading-strategy` — external `<script src>` uses `async`, `defer` or `type="module"` |
| `no-unnecessary-use-prefix.tsx` | `no-unnecessary-use-prefix` — `use*` functions must call another hook |

```bash
pnpm lint
```
