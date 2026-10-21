import { booleanNameRule } from './boolean-name.js'
import { eventHandlerNameRule } from './event-handler-name.js'
import { mapTransformerNameRule } from './map-transformer-name.js'
import { narrowEffectDepsRule } from './narrow-effect-deps.js'
import { noCallbackOnlySubscriptionRule } from './no-callback-only-subscription.js'
import { noDynamicImportPathRule } from './no-dynamic-import-path.js'
import { noStaticRenderPropRule } from './no-static-render-prop.js'
import { noTrivialUseMemoRule } from './no-trivial-use-memo.js'
import { noUnnecessaryUsePrefixRule } from './no-unnecessary-use-prefix.js'
import { preferFlatMapOverMapFilterRule } from './prefer-flat-map-over-map-filter.js'
import { preferFunctionalSetStateRule } from './prefer-functional-set-state.js'
import { preferUseTransitionRule } from './prefer-use-transition.js'
import { requirePassiveEventListenerRule } from './require-passive-event-listener.js'
import { requireScriptLoadingStrategyRule } from './require-script-loading-strategy.js'
import { sortTransformerNameRule } from './sort-transformer-name.js'

const WARN = 'warn'

/** @type {import('eslint').Linter.RulesRecord} */
export const conventionsRules = {
	'@nerdfish/conventions/boolean-name': WARN,
	'@nerdfish/conventions/event-handler-name': WARN,
	'@nerdfish/conventions/map-transformer-name': WARN,
	'@nerdfish/conventions/narrow-effect-deps': WARN,
	'@nerdfish/conventions/no-callback-only-subscription': WARN,
	'@nerdfish/conventions/no-dynamic-import-path': WARN,
	'@nerdfish/conventions/no-static-render-prop': WARN,
	'@nerdfish/conventions/no-trivial-use-memo': WARN,
	'@nerdfish/conventions/no-unnecessary-use-prefix': WARN,
	'@nerdfish/conventions/prefer-flat-map-over-map-filter': WARN,
	'@nerdfish/conventions/prefer-functional-set-state': WARN,
	'@nerdfish/conventions/prefer-use-transition': WARN,
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
		'narrow-effect-deps': narrowEffectDepsRule,
		'no-callback-only-subscription': noCallbackOnlySubscriptionRule,
		'no-dynamic-import-path': noDynamicImportPathRule,
		'no-static-render-prop': noStaticRenderPropRule,
		'no-trivial-use-memo': noTrivialUseMemoRule,
		'no-unnecessary-use-prefix': noUnnecessaryUsePrefixRule,
		'prefer-flat-map-over-map-filter': preferFlatMapOverMapFilterRule,
		'prefer-functional-set-state': preferFunctionalSetStateRule,
		'prefer-use-transition': preferUseTransitionRule,
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
