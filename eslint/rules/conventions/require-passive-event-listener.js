import { getMemberPropertyName, resolveStaticStringArg } from '../util.js'

/** Events where a blocking listener delays scrolling. */
const SCROLL_BLOCKING_EVENTS = new Set([
	'scroll',
	'touchmove',
	'touchstart',
	'wheel',
])

function hasPassiveOption(options) {
	return options.properties.some(
		(property) =>
			property.type === 'Property' &&
			!property.computed &&
			((property.key.type === 'Identifier' &&
				property.key.name === 'passive') ||
				(property.key.type === 'Literal' && property.key.value === 'passive')),
	)
}

export const requirePassiveEventListenerRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require scroll, wheel and touch listeners to state `passive` explicitly.',
			guidelineRuleId: 'client-passive-event-listeners',
		},

		schema: [],

		messages: {
			requirePassive:
				"'{{eventName}}' listeners block scrolling unless passive. Pass `{ passive: true }`, or `{ passive: false }` if the handler calls `preventDefault()`.",
		},
	},

	create(context) {
		/**
		 * Checks:
		 * window.addEventListener('scroll', handleScroll, { passive: true }) ✅
		 * el.addEventListener('touchmove', handleMove, { passive: false }) ✅ (explicit)
		 * el.addEventListener('scroll', handleScroll, options) ✅ (not inspectable)
		 * window.addEventListener('scroll', handleScroll) ❌
		 * el.addEventListener('wheel', handleWheel, { capture: true }) ❌
		 * el.addEventListener('wheel', handleWheel, true) ❌
		 */
		return {
			CallExpression(node) {
				if (getMemberPropertyName(node.callee) !== 'addEventListener') {
					return
				}

				const eventName = resolveStaticStringArg(node)?.value

				if (!eventName || !SCROLL_BLOCKING_EVENTS.has(eventName)) {
					return
				}

				const options = node.arguments[2]

				// A boolean third argument only sets `capture`.
				if (
					options &&
					options.type !== 'Literal' &&
					(options.type !== 'ObjectExpression' ||
						options.properties.some(
							(property) => property.type === 'SpreadElement',
						) ||
						hasPassiveOption(options))
				) {
					return
				}

				context.report({
					node,
					messageId: 'requirePassive',
					data: {
						eventName,
					},
				})
			},
		}
	},
}
