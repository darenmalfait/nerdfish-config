# Conventions rule fixtures

Valid examples for `@nerdfish/config/eslint/conventions`. CI fails if rules regress
and these no longer pass.

| Fixture | Rule |
| --- | --- |
| `map-transformer-name.ts` | `map-transformer-name` — named `.map()` / `.flatMap()` / `Array.from()` callbacks start with `to` |
| `sort-transformer-name.ts` | `sort-transformer-name` — named `.sort()` / `.toSorted()` comparators start with `by` |
| `event-handler-name.tsx` | `event-handler-name` — named JSX `on*` handlers start with `handle` |
| `boolean-name.ts` | `unicorn/consistent-boolean-name` — boolean locals start with `is`, `has`, … |
| `no-static-render-prop.tsx` | `no-static-render-prop` — `render*` props must take arguments; static structure goes in children |
| `narrow-effect-deps.tsx` | `narrow-effect-deps` — effect, `useMemo` and `useCallback` deps list the properties read, not the whole object |
| `no-callback-only-subscription.tsx` | `no-callback-only-subscription` — no `useSearchParams()` (configurable) read only in event handlers |
| `prefer-use-transition.tsx` | `prefer-use-transition` — `useTransition` instead of `setLoading(true)` … `await` … `setLoading(false)` |
| `no-paste-blocking.tsx` | `no-paste-blocking` — `onPaste` handlers don't call `preventDefault()` |
| `no-transition-all.tsx` | `no-transition-all` — no `transition-all` / `transition: all` |
| `prefer-ellipsis-character.tsx` | `prefer-ellipsis-character` — `…` instead of `...` in rendered text |
| `require-focus-visible-replacement.tsx` | `require-focus-visible-replacement` — `outline-none` / `outline-hidden` need a `focus-visible:` style |
| `require-img-dimensions.tsx` | `require-img-dimensions` — `<img>` has `width` and `height` |
| `require-input-autocomplete.tsx` | `require-input-autocomplete` — email/password/tel inputs have `autoComplete` |
| `no-dynamic-import-path.ts` | `no-dynamic-import-path` — `import()` takes a static string path |
| `no-trivial-use-memo.tsx` | `no-trivial-use-memo` — no `useMemo` around call-free, allocation-free expressions |
| `prefer-flat-map-over-map-filter.ts` | `prefer-flat-map-over-map-filter` — `.flatMap()` instead of `.map(…).filter(Boolean)` |
| `prefer-functional-set-state.tsx` | `prefer-functional-set-state` — updater form when next state reads current state |
| `require-passive-event-listener.ts` | `require-passive-event-listener` — scroll/wheel/touch listeners state `passive` explicitly |
| `require-script-loading-strategy.tsx` | `require-script-loading-strategy` — external `<script src>` uses `async`, `defer` or `type="module"` |
| `no-unnecessary-use-prefix.tsx` | `react-x/no-unnecessary-use-prefix` — `use*` functions must call another hook |
| `no-unstable-hook-defaults.ts` | `no-unstable-hook-defaults` — no inline `[]` / `{}` / function defaults in hook params or destructured hook results |
| `require-timer-cleanup.tsx` | `require-timer-cleanup` — timers started in an effect are cleared in its cleanup |
| `no-unmerged-classname.tsx` | `no-unmerged-classname` — components merge the incoming `className` instead of overriding or dropping it |
| `require-reduced-motion.tsx` | `require-reduced-motion` — `animate-*` uses `motion-safe:` or has a `motion-reduce:` fallback |
| `prefer-hook-return-object.ts` | `prefer-hook-return-object` — hooks returning more than 2 values return an object |
| `prefer-early-return.ts` | `unicorn/prefer-early-return` — guard clause instead of a trailing `if` wrapping the rest of the function |
| `no-negated-variables.ts` | `no-negated-variables` — no `isNot*` / `cannot*` / `dont*` names |
| `module-constant-name.ts` | `module-constant-name` — non-exported module constants with a static value use `SCREAMING_SNAKE_CASE` |
| `no-accumulator-spread.ts` | `no-accumulator-spread` — no `...acc` / `acc.concat()` in reduce callbacks |
| `no-object-keys-includes.ts` | `no-object-keys-includes` — `Object.hasOwn(obj, key)` instead of `Object.keys(obj).includes(key)` |
| `no-deep-equal-in-memo.tsx` | `no-deep-equal-in-memo` — `memo` comparators compare specific props, not `isEqual` / `JSON.stringify` |

```bash
pnpm lint
```
