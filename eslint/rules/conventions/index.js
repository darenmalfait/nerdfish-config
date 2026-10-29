import reactX from 'eslint-plugin-react-x'
import unicorn from 'eslint-plugin-unicorn'
import { contextValueInterfaceRule } from './context-value-interface.js'
import { eventHandlerNameRule } from './event-handler-name.js'
import { mapTransformerNameRule } from './map-transformer-name.js'
import { moduleConstantNameRule } from './module-constant-name.js'
import { narrowEffectDepsRule } from './narrow-effect-deps.js'
import { noAccumulatorSpreadRule } from './no-accumulator-spread.js'
import { noBooleanModePropsRule } from './no-boolean-mode-props.js'
import { noBrowserGlobalsInRenderRule } from './no-browser-globals-in-render.js'
import { noCallbackOnlySubscriptionRule } from './no-callback-only-subscription.js'
import { noCompoundComponentObjectRule } from './no-compound-component-object.js'
import { noContextMenuRule } from './no-context-menu.js'
import { noDeepEqualInMemoRule } from './no-deep-equal-in-memo.js'
import { noDynamicImportPathRule } from './no-dynamic-import-path.js'
import { noNegatedVariablesRule } from './no-negated-variables.js'
import { noObjectKeysIncludesRule } from './no-object-keys-includes.js'
import { noPasteBlockingRule } from './no-paste-blocking.js'
import { noStaticRenderPropRule } from './no-static-render-prop.js'
import { noTransitionAllRule } from './no-transition-all.js'
import { noTrivialUseMemoRule } from './no-trivial-use-memo.js'
import { noUnmergedClassnameRule } from './no-unmerged-classname.js'
import { noUnstableHookDefaultsRule } from './no-unstable-hook-defaults.js'
import { preferEarlyReturnStatesRule } from './prefer-early-return-states.js'
import { preferEllipsisCharacterRule } from './prefer-ellipsis-character.js'
import { preferExplicitVariantsRule } from './prefer-explicit-variants.js'
import { preferFlatMapOverMapFilterRule } from './prefer-flat-map-over-map-filter.js'
import { preferFunctionalSetStateRule } from './prefer-functional-set-state.js'
import { preferHookReturnObjectRule } from './prefer-hook-return-object.js'
import { preferUseTransitionRule } from './prefer-use-transition.js'
import { requireFocusVisibleReplacementRule } from './require-focus-visible-replacement.js'
import { requireImgDimensionsRule } from './require-img-dimensions.js'
import { requireInputAutocompleteRule } from './require-input-autocomplete.js'
import { requirePassiveEventListenerRule } from './require-passive-event-listener.js'
import { requireReducedMotionRule } from './require-reduced-motion.js'
import { requireScriptLoadingStrategyRule } from './require-script-loading-strategy.js'
import { requireTimerCleanupRule } from './require-timer-cleanup.js'
import { sortTransformerNameRule } from './sort-transformer-name.js'

const WARN = 'warn'

/** @type {import('eslint').Linter.RulesRecord} */
export const conventionsRules = {
	'@nerdfish/conventions/context-value-interface': WARN,
	'@nerdfish/conventions/event-handler-name': WARN,
	'@nerdfish/conventions/map-transformer-name': WARN,
	'@nerdfish/conventions/module-constant-name': WARN,
	'@nerdfish/conventions/narrow-effect-deps': WARN,
	'@nerdfish/conventions/no-accumulator-spread': WARN,
	'@nerdfish/conventions/no-boolean-mode-props': WARN,
	'@nerdfish/conventions/no-browser-globals-in-render': WARN,
	'@nerdfish/conventions/no-callback-only-subscription': WARN,
	'@nerdfish/conventions/no-compound-component-object': WARN,
	'@nerdfish/conventions/no-context-menu': WARN,
	'@nerdfish/conventions/no-deep-equal-in-memo': WARN,
	'@nerdfish/conventions/no-dynamic-import-path': WARN,
	'@nerdfish/conventions/no-negated-variables': WARN,
	'@nerdfish/conventions/no-object-keys-includes': WARN,
	'@nerdfish/conventions/no-paste-blocking': WARN,
	'@nerdfish/conventions/no-static-render-prop': WARN,
	'@nerdfish/conventions/no-transition-all': WARN,
	'@nerdfish/conventions/no-trivial-use-memo': WARN,
	'@nerdfish/conventions/no-unmerged-classname': WARN,
	'@nerdfish/conventions/no-unstable-hook-defaults': WARN,
	'@nerdfish/conventions/prefer-early-return-states': WARN,
	'@nerdfish/conventions/prefer-ellipsis-character': WARN,
	'@nerdfish/conventions/prefer-explicit-variants': WARN,
	'@nerdfish/conventions/prefer-flat-map-over-map-filter': WARN,
	'@nerdfish/conventions/prefer-functional-set-state': WARN,
	'@nerdfish/conventions/prefer-hook-return-object': WARN,
	'@nerdfish/conventions/prefer-use-transition': WARN,
	'@nerdfish/conventions/require-focus-visible-replacement': WARN,
	'@nerdfish/conventions/require-img-dimensions': WARN,
	'@nerdfish/conventions/require-input-autocomplete': WARN,
	'@nerdfish/conventions/require-passive-event-listener': WARN,
	'@nerdfish/conventions/require-reduced-motion': WARN,
	'@nerdfish/conventions/require-script-loading-strategy': WARN,
	'@nerdfish/conventions/require-timer-cleanup': WARN,
	'@nerdfish/conventions/sort-transformer-name': WARN,
	// Upstream rules that cover conventions we used to implement ourselves
	'react-x/no-unnecessary-use-prefix': WARN,
	'unicorn/consistent-boolean-name': [
		WARN,
		// Variables only: checking parameters would flag every `({ open, disabled })` prop
		{ checkArguments: 'never', checkFunctions: 'never' },
	],
	'unicorn/no-declarations-before-early-exit': WARN,
	'unicorn/prefer-at': WARN,
	'unicorn/prefer-early-return': WARN,
}

/** Nerdfish coding conventions — opt in via spread alongside `@nerdfish/config/eslint`. */
export const plugin = {
	rules: {
		'context-value-interface': contextValueInterfaceRule,
		'event-handler-name': eventHandlerNameRule,
		'map-transformer-name': mapTransformerNameRule,
		'module-constant-name': moduleConstantNameRule,
		'narrow-effect-deps': narrowEffectDepsRule,
		'no-accumulator-spread': noAccumulatorSpreadRule,
		'no-boolean-mode-props': noBooleanModePropsRule,
		'no-browser-globals-in-render': noBrowserGlobalsInRenderRule,
		'no-callback-only-subscription': noCallbackOnlySubscriptionRule,
		'no-compound-component-object': noCompoundComponentObjectRule,
		'no-context-menu': noContextMenuRule,
		'no-deep-equal-in-memo': noDeepEqualInMemoRule,
		'no-dynamic-import-path': noDynamicImportPathRule,
		'no-negated-variables': noNegatedVariablesRule,
		'no-object-keys-includes': noObjectKeysIncludesRule,
		'no-paste-blocking': noPasteBlockingRule,
		'no-static-render-prop': noStaticRenderPropRule,
		'no-transition-all': noTransitionAllRule,
		'no-trivial-use-memo': noTrivialUseMemoRule,
		'no-unmerged-classname': noUnmergedClassnameRule,
		'no-unstable-hook-defaults': noUnstableHookDefaultsRule,
		'prefer-early-return-states': preferEarlyReturnStatesRule,
		'prefer-ellipsis-character': preferEllipsisCharacterRule,
		'prefer-explicit-variants': preferExplicitVariantsRule,
		'prefer-flat-map-over-map-filter': preferFlatMapOverMapFilterRule,
		'prefer-functional-set-state': preferFunctionalSetStateRule,
		'prefer-hook-return-object': preferHookReturnObjectRule,
		'prefer-use-transition': preferUseTransitionRule,
		'require-focus-visible-replacement': requireFocusVisibleReplacementRule,
		'require-img-dimensions': requireImgDimensionsRule,
		'require-input-autocomplete': requireInputAutocompleteRule,
		'require-passive-event-listener': requirePassiveEventListenerRule,
		'require-reduced-motion': requireReducedMotionRule,
		'require-script-loading-strategy': requireScriptLoadingStrategyRule,
		'require-timer-cleanup': requireTimerCleanupRule,
		'sort-transformer-name': sortTransformerNameRule,
	},
}

/** @type {import('eslint').Linter.Config[]} */
export const config = [
	{
		files: ['**/*.ts?(x)', '**/*.js?(x)'],
		plugins: {
			'@nerdfish/conventions': plugin,
			'react-x': reactX,
			unicorn,
		},
		rules: conventionsRules,
	},
]

export default config
