import { mapTransformerNameRule } from './map-transformer-name.js'

const WARN = 'warn'

/** @type {import('eslint').Linter.RulesRecord} */
export const opinionatedRules = {
	'@nerdfish/opinionated/map-transformer-name': WARN,
}

/** Nerdfish style opinions — opt in via spread alongside `@nerdfish/config/eslint`. */
export const plugin = {
	rules: {
		'map-transformer-name': mapTransformerNameRule,
	},
}

/** @type {import('eslint').Linter.Config[]} */
export const config = [
	{
		files: ['**/*.ts?(x)', '**/*.js?(x)'],
		plugins: {
			'@nerdfish/opinionated': plugin,
		},
		rules: opinionatedRules,
	},
]

export default config
