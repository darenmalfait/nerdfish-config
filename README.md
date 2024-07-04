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

## Usage

The inspiration and codebase was taken from [epicweb config](https://github.com/epicweb-dev/config), and modified to fit the needs of nerdfish.

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

### TypeScript

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

Because of the tabs instead of spaces, we need to use a custom `.editorconfig` file for github, otherwise the indents will be a bit off.


## VSCode Setup

To make sure your editor is using the correct settings, you can add the following to your `.vscode/settings.json` and `.vscode/extensions.json` files.

```json
// .vscode/settings.json​
{​
  "editor.codeActionsOnSave": {"source.fixAll.eslint": "explicit"},
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true​
}
```

```json
// .vscode/extensions.json​
{
  "recommendations": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"]
}
```

## License

MIT
