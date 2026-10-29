import { describe, it } from 'node:test'
import { RuleTester } from 'eslint'
import tseslint from 'typescript-eslint'

// RuleTester looks for global describe/it, which node:test doesn't define.
RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

/** RuleTester for `*.spec.js` next to each rule: TypeScript parser with JSX, run by `node --test`. */
export const ruleTester = new RuleTester({
	languageOptions: {
		parser: tseslint.parser,
		parserOptions: { ecmaFeatures: { jsx: true } },
	},
})
