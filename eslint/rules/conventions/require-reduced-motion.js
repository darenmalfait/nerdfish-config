import {
	createClassRootVisitor,
	getStringValue,
	getUtility,
} from './class-tokens.js'

function isUnguardedAnimation(token) {
	const utility = getUtility(token)

	return (
		utility.startsWith('animate-') &&
		utility !== 'animate-none' &&
		!token.includes('motion-safe:')
	)
}

/** `'animate-spin p-2'` → `'motion-safe:animate-spin p-2'`, or null when the raw text has escapes. */
function getGuardedRaw(literal) {
	const quote = literal.raw[0]
	const content = literal.raw.slice(1, -1)

	if (content !== literal.value) {
		return null
	}

	const guarded = content.replaceAll(/\S+/g, (token) =>
		isUnguardedAnimation(token) ? `motion-safe:${token}` : token,
	)

	return `${quote}${guarded}${quote}`
}

export const requireReducedMotionRule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',

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
		return createClassRootVisitor(context, (node, tokens, strings) => {
			const animation = tokens.find(isUnguardedAnimation)

			if (
				!animation ||
				tokens.some((token) => token.includes('motion-reduce:'))
			) {
				return
			}

			const animatedStrings = strings.filter((string) =>
				getStringValue(string).split(/\s+/).some(isUnguardedAnimation),
			)
			// Only plain string literals are rewritten; template chunks are left to the author.
			const fixes = animatedStrings.every((string) => string.type === 'Literal')
				? animatedStrings.map((literal) => [literal, getGuardedRaw(literal)])
				: []
			const isFixable =
				fixes.length > 0 && fixes.every(([, raw]) => raw !== null)

			context.report({
				node,
				messageId: 'requireReducedMotion',
				data: { token: animation, utility: getUtility(animation) },
				fix: isFixable
					? (fixer) =>
							fixes.map(([literal, raw]) => fixer.replaceText(literal, raw))
					: null,
			})
		})
	},
}
