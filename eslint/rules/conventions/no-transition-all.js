import { resolveStaticStringValue } from '../util.js'
import { createClassRootVisitor, getUtility } from './class-tokens.js'

const TRANSITION_STYLE_KEYS = new Set(['transition', 'transitionProperty'])

function getPropertyName(property) {
	if (property.computed) {
		return null
	}

	if (property.key.type === 'Identifier') {
		return property.key.name
	}

	return property.key.type === 'Literal' ? String(property.key.value) : null
}

export const noTransitionAllRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow transitioning all properties (`transition-all`, `transition: all`).',
			guidelineRuleId: 'web-interface-guidelines.animation',
		},

		schema: [],

		messages: {
			noTransitionAll:
				'Transitioning `all` animates layout properties you did not mean to (and is slower). List the properties instead, e.g. `transition-[opacity,transform]`, `transition-colors`, or `transition: opacity 150ms`.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * className="transition-colors" ✅
		 * style={{ transition: 'opacity 150ms' }} ✅
		 * className="transition-all duration-200" ❌
		 * cn('hover:transition-all') ❌
		 * style={{ transition: 'all 150ms' }} ❌
		 */
		return {
			...createClassRootVisitor(context, (node, tokens) => {
				if (tokens.some((token) => getUtility(token) === 'transition-all')) {
					context.report({ node, messageId: 'noTransitionAll' })
				}
			}),

			Property(node) {
				if (!TRANSITION_STYLE_KEYS.has(getPropertyName(node))) {
					return
				}

				const value = resolveStaticStringValue(node.value, { trim: true })

				if (value !== null && /^all\b/.test(value)) {
					context.report({ node, messageId: 'noTransitionAll' })
				}
			},
		}
	},
}
