<div>
  <h1 align="center"><a href="https://npm.im/@nerdfish/config">👮 @nerdfish/config</a></h1>
  <strong>
    Foundation configuration for nerdfish web projects
  </strong>

</div>

```
npm install @nerdfish/config --save-dev
pnpm install @nerdfish/config --save-dev
yarn add @nerdfish/config --dev
```

create a `reset.d.ts` file in your project root with the following content:

```ts
import '@nerdfish/config/reset.d.ts'
```

## Biomejs (experimental)

If you're running VS Code, ensure you have the following extensions installed:

```
code --install-extension biomejs.biome
code --install-extension bradlc.vscode-tailwindcss
```

Create a `biome.json` file in your project root with the following contents:

```json
{ "extends": ["@nerdfish/config/biome"] }
```

### VSCode Setup

Create a `.vscode/settings.json` file with the following contents to enable full
formatting and fixing on save:

```json
{
	"typescript.tsdk": "node_modules/typescript/lib",
	"editor.defaultFormatter": "biomejs.biome",
	"editor.formatOnSave": true,
	"editor.formatOnPaste": true,
	"emmet.showExpandedAbbreviation": "never",
	"editor.codeActionsOnSave": {
		"quickfix.biome": "always",
		"source.organizeImports.biome": "always"
	},
	"[typescript]": {
		"editor.defaultFormatter": "biomejs.biome"
	},
	"[json]": {
		"editor.defaultFormatter": "biomejs.biome"
	},
	"[javascript]": {
		"editor.defaultFormatter": "biomejs.biome"
	},
	"[jsonc]": {
		"editor.defaultFormatter": "biomejs.biome"
	},
	"[typescriptreact]": {
		"editor.defaultFormatter": "biomejs.biome"
	}
}
```

Ensure your `tsconfig.json` (if it exists) includes your new ESLint config and
that `strictNullChecks` is enabled.

```json
{
	"compilerOptions": {
		"strictNullChecks": true
	}
}
```

Lastly, ensure you have the following scripts in your `package.json`:

```json
"lint:fix": "npx biome check --write ./",
"lint": "npx biome check",
```

## Prettier/Eslint Usage

The inspiration and codebase was taken from
[epicweb config](https://github.com/epicweb-dev/config), and modified to fit the
needs of nerdfish.

### Prettier

The easiest way to use this config is in your `package.json`:

```json
"prettier": "@nerdfish/config/prettier"
```

<details>
  <summary>Customizing prettier</summary>

If you want to customize things, you should probably just copy/paste the
built-in config. But if you really want, you can override it using regular
JavaScript stuff.

Create a `.prettierrc.js` file in your project root with the following content:

```js
import defaultConfig from '@nerdfish/config/prettier'

/** @type {import("prettier").Options} */
export default {
	...defaultConfig,
	// .. your overrides here...
}
```

</details>

### ESLint

Create a `eslint.config.js` file in your project root with the following
content:

```js
import { config as defaultConfig } from '@nerdfish/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [...defaultConfig]
```

#### File and folder names

`unicorn/filename-case` keeps file and folder names kebab-case. It only checks
letters, digits, `_` and `-`, so route syntax from React Router and Next.js
passes: `blog.$slug`, `($lang)`, `_auth`, `(group)`, `[slug]`, `@slot`.
`__tests__`, `__mocks__` and React Router's layout opt-out (`concerts_.mine`)
are skipped.

```txt
src/features/user-profile/components/avatar-menu.tsx   ✓
src/features/userProfile/AvatarMenu.tsx                ✗ folder and file
app/routes/blog.$slug/route.tsx                        ✓
app/(marketing)/blog/[post-id]/page.tsx                ✓
app/(marketing)/blog/[postId]/page.tsx                 ✗ use [post-id]
```

#### Import order

`perfectionist/sort-imports` sorts imports into blocks separated by a blank
line. Biome's `organizeImports` in `@nerdfish/config/biome` uses the same order.

```ts
import './polyfills' // side effects, kept in the order you wrote them

import './globals.css' // side-effect styles

import fs from 'node:fs'

import { useState } from 'react' // react and react-* lead the packages
import { z } from 'zod'

import { i18n } from '@repo/i18n/config' // monorepo packages: @repo/*

import { cn } from '#app/utils' // aliases: #, @/, ~/

import styles from './button.module.css'

import { theme } from '../theme'

import { Icon } from './icon'
```

Biome leaves side-effect imports where they are; ESLint moves them to the top.

To give your own imports a block of their own between `@repo/*` and aliases,
such as a design system or test utilities, add `sortImports` after the default
config. Each `customGroups` entry takes perfectionist's
[custom group options](https://perfectionist.dev/rules/sort-imports#customgroups).
Blocks appear in the order listed:

```js
import { config as defaultConfig, sortImports } from '@nerdfish/config/eslint'

export default [
	...defaultConfig,
	sortImports({
		customGroups: [
			{ groupName: 'design-system', elementNamePattern: '^@acme/ui' },
			{ groupName: 'test-utils', elementNamePattern: '^#tests/' },
		],
	}),
]
```

If you also organize imports with Biome, copy the `groups` from
`@nerdfish/config/biome` into your `biome.json`. Add the same patterns after
`"@repo/**"`, each followed by `":BLANK_LINE:"`, and exclude them from the
packages group, since Biome puts an import in the first group that matches:

```json
[":PACKAGE:", "!@repo/**", "!@acme/ui/**"],
":BLANK_LINE:",
"@repo/**",
":BLANK_LINE:",
"@acme/ui/**",
":BLANK_LINE:",
":ALIAS:",
```

#### Import cycles

`import/no-cycle` warns when a module imports itself back through other modules,
like `components/list.tsx` → `utils/format.ts` → `components/list.tsx`. In a
cycle one module runs before its imports finish initializing, which shows up as
`Cannot access 'X' before initialization` or a silent `undefined` depending on
load order. Type-only imports are skipped, since they're erased. The config
swaps in its own copy of import-x's rule, with the same name and options, whose
messages name the import that closes the cycle and how to break it: move what
both sides need into a module neither imports, make the import type-only, or
merge the files.

Imports resolve through your tsconfig or jsconfig `paths` (via
`eslint-import-resolver-typescript`), so cycles through `@/` or `~/` aliases
count too. The rule follows at most 10 imports deep. On a large app it is the
slowest rule in the config; to run it only in CI, turn it off locally:

```js
export default [
	...defaultConfig,
	process.env.CI ? {} : { rules: { 'import/no-cycle': 'off' } },
]
```

#### Opinionated testing rules (optional)

Everything below is part of **`@nerdfish/config`** — install once, no extra
packages.

| What you import                       | What it enables                                                                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `@nerdfish/config/eslint/testing`     | Testing Library queries, no snapshots, HTTP mock lifecycle, partial mocks                                                        |
| `@nerdfish/config/eslint/testing/bdd` | User Story / Given / When structure (optional add-on)                                                                            |
| `@nerdfish/config/eslint/conventions` | Team coding conventions (`to*`/`by*` transformers, `handle*` handlers, `is*`/`has*` booleans, `use*` hooks, no bare `useEffect`) |

Spread the flat configs you need:

```js
import { config as defaultConfig } from '@nerdfish/config/eslint'
import { config as testingConfig } from '@nerdfish/config/eslint/testing'
import { config as testingBddConfig } from '@nerdfish/config/eslint/testing/bdd'
import { config as conventionsConfig } from '@nerdfish/config/eslint/conventions'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	...testingConfig,
	// ...testingBddConfig, // optional
	// ...conventionsConfig, // optional
]
```

**ESLint plugin namespaces (not npm packages).** Custom rules still need a
plugin name in flat config. Ours are `@nerdfish/testing`,
`@nerdfish/testing-bdd`, and `@nerdfish/conventions` — they look like package
names but only label rule IDs, e.g. `@nerdfish/testing/no-testid-queries`,
`@nerdfish/testing-bdd/bdd-split-on-and`, and
`@nerdfish/conventions/map-transformer-name`, and
`@nerdfish/conventions/sort-transformer-name`, and
`@nerdfish/conventions/no-static-render-prop`, and
`@nerdfish/conventions/no-render-functions`, and
`@nerdfish/conventions/no-boolean-mode-props`, and
`@nerdfish/conventions/prefer-explicit-variants`, and
`@nerdfish/conventions/context-value-interface`, and
`@nerdfish/conventions/prefer-early-return-states`, and
`@nerdfish/conventions/no-compound-component-object`, and
`@nerdfish/conventions/require-passive-event-listener`, and
`@nerdfish/conventions/require-script-loading-strategy`, and
`@nerdfish/conventions/no-dynamic-import-path`, and
`@nerdfish/conventions/no-trivial-use-memo`, and
`@nerdfish/conventions/prefer-flat-map-over-map-filter`, and
`@nerdfish/conventions/prefer-functional-set-state`, and
`@nerdfish/conventions/narrow-effect-deps`, and
`@nerdfish/conventions/no-callback-only-subscription`, and
`@nerdfish/conventions/prefer-use-transition`, and
`@nerdfish/conventions/no-paste-blocking`, and
`@nerdfish/conventions/no-transition-all`, and
`@nerdfish/conventions/prefer-ellipsis-character`, and
`@nerdfish/conventions/require-focus-visible-replacement`, and
`@nerdfish/conventions/require-img-dimensions`, and
`@nerdfish/conventions/require-input-autocomplete`, and
`@nerdfish/conventions/no-unstable-hook-defaults`, and
`@nerdfish/conventions/require-timer-cleanup`, and
`@nerdfish/conventions/no-unmerged-classname`, and
`@nerdfish/conventions/require-reduced-motion`, and
`@nerdfish/conventions/prefer-hook-return-object`, and
`@nerdfish/conventions/no-negated-variables`, and
`@nerdfish/conventions/module-constant-name`, and
`@nerdfish/conventions/no-accumulator-spread`, and
`@nerdfish/conventions/no-object-keys-includes`, and
`@nerdfish/conventions/no-deep-equal-in-memo`, and
`@nerdfish/conventions/no-browser-globals-in-render`, and
`@nerdfish/conventions/no-context-menu`, and
`@nerdfish/conventions/effect-components`, and
`@nerdfish/conventions/component-props-naming`, and
`@nerdfish/conventions/no-navigate-prefer-link`, and
`@nerdfish/conventions/no-miscased-acronym`, and
`@nerdfish/conventions/feature-folder-structure`, and
`@nerdfish/conventions/no-cross-feature-imports`, and
`@nerdfish/conventions/no-requests-outside-api`. The conventions config also
enables `react-x/no-unnecessary-use-prefix`, `unicorn/consistent-boolean-name`,
`unicorn/no-declarations-before-early-exit`, `unicorn/prefer-at` and
`unicorn/prefer-early-return`.

`no-browser-globals-in-render` always reports browser globals read during
render. Its module-scope check turns on automatically when an SSR framework
(Next.js, Remix, React Router, Astro, …) is installed; set
`{ moduleScope: true | false }` to override.

`no-navigate-prefer-link` matches `navigate()` and `router.push()` calls; pass
`{ functions: ['navigate', 'router.push', …] }` to match other navigation calls.

`no-miscased-acronym` enforces `API`, `ID`, `OIDC`, `SAML`, `SSO` and `URL` as
`Api`, `Id`, … inside names; pass `{ acronyms: ['API', 'URL', …] }` to change
the list.

`feature-folder-structure` and `no-cross-feature-imports` follow
[bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md):
one folder per feature in `features/` or `modules/`, each holding only `api`,
`assets`, `components`, `forms`, `hooks`, `providers`, `types` and `utils`
folders. Imports flow one way, shared → features → app: features don't import
from each other, shared folders (`components`, `config`, `hooks`, `lib`,
`providers`, `types`, `utils`) next to `features/` don't import from features,
and neither imports from the app layer (`app/` or `routes/` next to
`features/`). Routes and pages compose them. In Remix, `app/` is the root
holding `features/`, so only `app/routes/` counts as the app layer. Pass
`{ roots: ['domains'] }` to either rule to rename the feature folder,
`{ folders: […] }` to `feature-folder-structure` and `{ shared: […] }` or
`{ app: […] }` to `no-cross-feature-imports` to change the folder lists.

```txt
src/features/users/api/get-user.ts                    ✓
src/features/users/users.tsx                          ✗ no loose files
src/features/users/helpers/format.ts                  ✗ not a feature folder
src/features/comments/… imports @/features/users/…    ✗ cross-feature
src/components/… imports @/features/users/…           ✗ shared → feature
src/features/users/… imports @/app/provider           ✗ feature → app
src/components/… imports @/app/routes/paths           ✗ shared → app
src/app/routes/… imports @/features/users/…           ✓
```

When a feature needs something from another one, the error names the way out for
what it imports:

- **Data or logic** (`api/`, `hooks/`, …): the route calls `users` and passes
  the result to `comments` as props, typed with only the fields `comments`
  reads. If many features need it, move it to shared `lib/`. If `comments` needs
  the data in its own shape, give it its own `api/` call.
- **Types**: `comments` declares the fields it reads itself; structural typing
  accepts `users` data passed in from the route. A domain model many features
  share goes in shared `types/`.
- **Components**: `comments` takes a slot (`children` or an element prop) and
  the route passes `<UserCard />` in.

```tsx
// src/app/routes/discussion.tsx
const user = useUser(userId)

return <Comments author={user.data} avatar={<UserAvatar user={user.data} />} />
```

`no-requests-outside-api` keeps a feature's requests in its `api/` folder,
[as bulletproof-react does](https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md):
each file there exports the fetcher, its query options and a hook, and the rest
of the feature calls the hook. It reports `fetch`, API client calls (`axios`,
`ky`, `apiClient`; add yours with `{ clients: […] }`) and TanStack Query or SWR
calls that define their own `queryFn`, `mutationFn` or fetcher. Spreading
options from `api/` and adding UI-only ones stays fine. Tests, mocks and stories
are skipped.

```txt
src/features/discussions/api/get-discussions.ts      useQuery({ queryKey, queryFn })   ✓
src/features/discussions/components/…                useDiscussions()                  ✓
src/features/discussions/components/…                useQuery({ ...getDiscussionsQueryOptions(), select })  ✓
src/features/discussions/components/…                useQuery({ queryKey, queryFn })   ✗
src/features/discussions/components/…                fetch('/api/discussions')         ✗
```

We use two namespaces so you can spread `@nerdfish/config/eslint/testing` and
`.../testing/bdd` in the same `eslint.config.js` without ESLint erroring on a
redefined plugin. BDD stays a separate subpath export; the namespace split is an
implementation detail of that opt-in.

To cherry-pick rules, import `plugin` (and `testingRules` / `bddRules` /
`conventionsRules`) from the matching subpath and wire them into your own config
block.

<details>
  <summary>Customizing ESLint</summary>

Learn more from
[the Eslint docs here](https://eslint.org/docs/latest/extend/shareable-configs#overriding-settings-from-shareable-configs).

</details>

### Github

Because of the tabs instead of spaces, we need to use a custom `.editorconfig`
file for github, otherwise the indents will be a bit off.

### VSCode Setup

Create a `.vscode/settings.json` file with the following contents to enable full
formatting and fixing on save:

```json
{
	"typescript.tsdk": "node_modules/typescript/lib",
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.formatOnSave": true,
	"editor.formatOnPaste": true,
	"emmet.showExpandedAbbreviation": "never",
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": "explicit"
	},
	"[typescript]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[json]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[javascript]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[jsonc]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	},
	"[typescriptreact]": {
		"editor.defaultFormatter": "esbenp.prettier-vscode"
	}
}
```

## TypeScript

Create a `tsconfig.json` file in your project root with the following content:

```json
{
	"extends": ["@nerdfish/config/typescript"],
	"include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
	"compilerOptions": {
		"paths": {
			"#app/*": ["./app/*"],
			"#tests/*": ["./tests/*"]
		}
	}
}
```

<details>
  <summary>Customizing TypeScript</summary>

Learn more from
[the TypeScript docs here](https://www.typescriptlang.org/tsconfig/#extends).

</details>

## License

MIT
