import { eventHandlerNameRule } from './event-handler-name.js'
import { mapTransformerNameRule } from './map-transformer-name.js'

const WARN = 'warn'

/** @type {import('eslint').Linter.RulesRecord} */
export const conventionsRules = {
	'@nerdfish/conventions/event-handler-name': WARN,
	'@nerdfish/conventions/map-transformer-name': WARN,
}

/** Nerdfish coding conventions — opt in via spread alongside `@nerdfish/config/eslint`. */
export const plugin = {
	rules: {
		'event-handler-name': eventHandlerNameRule,
		'map-transformer-name': mapTransformerNameRule,
	},
}

/** @type {import('eslint').Linter.Config[]} */
export const config = [
	{
		files: ['**/*.ts?(x)', '**/*.js?(x)'],
		plugins: {
			'@nerdfish/conventions': plugin,
		},
		rules: conventionsRules,
	},
]

export default config
