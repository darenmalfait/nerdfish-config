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
	"include": [
		"@nerdfish/config/reset.d.ts",
		"**/*.ts",
		"**/*.tsx",
		"**/*.js",
		"**/*.jsx"
	],
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
