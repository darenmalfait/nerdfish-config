import { booleanNameRule } from './boolean-name.js'
import { eventHandlerNameRule } from './event-handler-name.js'
import { mapTransformerNameRule } from './map-transformer-name.js'
import { noStaticRenderPropRule } from './no-static-render-prop.js'
import { noUnnecessaryUsePrefixRule } from './no-unnecessary-use-prefix.js'
import { requirePassiveEventListenerRule } from './require-passive-event-listener.js'
import { requireScriptLoadingStrategyRule } from './require-script-loading-strategy.js'
import { sortTransformerNameRule } from './sort-transformer-name.js'

const WARN = 'warn'

/** @type {import('eslint').Linter.RulesRecord} */
export const conventionsRules = {
	'@nerdfish/conventions/boolean-name': WARN,
	'@nerdfish/conventions/event-handler-name': WARN,
	'@nerdfish/conventions/map-transformer-name': WARN,
	'@nerdfish/conventions/no-static-render-prop': WARN,
	'@nerdfish/conventions/no-unnecessary-use-prefix': WARN,
	'@nerdfish/conventions/require-passive-event-listener': WARN,
	'@nerdfish/conventions/require-script-loading-strategy': WARN,
	'@nerdfish/conventions/sort-transformer-name': WARN,
}

/** Nerdfish coding conventions — opt in via spread alongside `@nerdfish/config/eslint`. */
export const plugin = {
	rules: {
		'boolean-name': booleanNameRule,
		'event-handler-name': eventHandlerNameRule,
		'map-transformer-name': mapTransformerNameRule,
		'no-static-render-prop': noStaticRenderPropRule,
		'no-unnecessary-use-prefix': noUnnecessaryUsePrefixRule,
		'require-passive-event-listener': requirePassiveEventListenerRule,
		'require-script-loading-strategy': requireScriptLoadingStrategyRule,
		'sort-transformer-name': sortTransformerNameRule,
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
