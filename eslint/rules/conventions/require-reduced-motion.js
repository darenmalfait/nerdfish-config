import { createClassRootVisitor, getUtility } from './class-tokens.js'

function isUnguardedAnimation(token) {
	const utility = getUtility(token)

	return (
		utility.startsWith('animate-') &&
		utility !== 'animate-none' &&
		!token.includes('motion-safe:')
	)
}

export const requireReducedMotionRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require Tailwind animations to respect `prefers-reduced-motion`.',
			url: 'https://github.com/grafana/grafana/blob/main/packages/grafana-eslint-rules/README.md#no-unreduced-motion',
		},

		schema: [],

		messages: {
			requireReducedMotion:
				'`{{token}}` also plays for users who asked for reduced motion. Use `motion-safe:{{utility}}`, or add a `motion-reduce:` fallback such as `motion-reduce:animate-none` in the same class list.',
		},
	},

	create(context) {
		/**
		 * Checks:
		 * className="motion-safe:animate-bounce" ✅
		 * className="animate-spin motion-reduce:animate-none" ✅
		 * cn('animate-pulse', 'motion-reduce:hidden') ✅
		 * className="animate-bounce" ❌
		 */
		return createClassRootVisitor(context, (node, tokens) => {
			const animation = tokens.find(isUnguardedAnimation)

			if (
				!animation ||
				tokens.some((token) => token.includes('motion-reduce:'))
			) {
				return
			}

			context.report({
				node,
				messageId: 'requireReducedMotion',
				data: { token: animation, utility: getUtility(animation) },
			})
		})
	},
}
