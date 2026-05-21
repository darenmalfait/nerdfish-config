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

#### Opinionated testing rules (optional)

Everything below is part of **`@nerdfish/config`** — install once, no extra
packages.

| What you import                       | What it enables                                       |
| ------------------------------------- | ----------------------------------------------------- |
| `@nerdfish/config/eslint/testing`     | Testing Library queries, HTTP mock lifecycle, partial mocks |
| `@nerdfish/config/eslint/testing/bdd` | User Story / Given / When structure (optional add-on) |
| `@nerdfish/config/eslint/conventions` | Team coding conventions (e.g. `.map()` transformer names) |

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
`@nerdfish/conventions/map-transformer-name`.

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
