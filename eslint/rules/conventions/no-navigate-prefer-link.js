import { resolveHandler } from '../util.js'

const DEFAULT_FUNCTIONS = ['navigate', 'router.push']

/** `navigate` → `navigate`, `router.push` → `router.push`; anything deeper is not matched. */
function getCalleeText(callee) {
	if (callee.type === 'Identifier') {
		return callee.name
	}

	return callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object.type === 'Identifier' &&
		callee.property.type === 'Identifier'
		? `${callee.object.name}.${callee.property.name}`
		: null
}

/** The single call a handler makes: `() => navigate(…)` or `() => { navigate(…) }`. */
function getOnlyCall(fn) {
	if (fn.body.type === 'CallExpression') {
		return fn.body
	}

	const [statement, ...rest] = fn.body.body ?? []

	return rest.length === 0 &&
		statement?.type === 'ExpressionStatement' &&
		statement.expression.type === 'CallExpression'
		? statement.expression
		: null
}

/** `navigate(-1)` moves through history; no `href` can express that. */
function isHistoryDelta(argument) {
	return (
		(argument?.type === 'Literal' && typeof argument.value === 'number') ||
		(argument?.type === 'UnaryExpression' &&
			argument.argument.type === 'Literal')
	)
}

export const noNavigatePreferLinkRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow `onClick` handlers that only navigate; render a link instead.',
			url: 'https://github.com/twentyhq/twenty/blob/main/packages/twenty-oxlint-rules/rules/no-navigate-prefer-link.ts',
		},

		schema: [
			{
				type: 'object',
				properties: {
					functions: {
						type: 'array',
						items: { type: 'string', minLength: 1 },
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			preferLink:
				'This `onClick` only calls `{{name}}()`. Render a `<Link>` instead: a real `href` gives middle-click, open in new tab, copy link, prefetching and the link role screen readers announce.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const options = context.options[0] || {}
		const functions = new Set(options.functions ?? DEFAULT_FUNCTIONS)

		/**
		 * Checks:
		 * <Link href="/settings">Settings</Link> ✅
		 * <button onClick={() => { save(); navigate('/done') }}> ✅ does more than navigate
		 * <button onClick={() => navigate(-1)}> ✅ history step, not a destination
		 * <button onClick={() => navigate('/settings')}> ❌
		 * <button onClick={handleOpen}> where handleOpen only calls router.push(…) ❌
		 */
		return {
			JSXAttribute(node) {
				if (
					node.name.type !== 'JSXIdentifier' ||
					node.name.name !== 'onClick' ||
					node.value?.type !== 'JSXExpressionContainer'
				) {
					return
				}

				const handler = resolveHandler(sourceCode, node.value.expression)
				const call = handler && getOnlyCall(handler)
				const name = call && getCalleeText(call.callee)

				if (
					name &&
					functions.has(name) &&
					call.arguments.length > 0 &&
					!isHistoryDelta(call.arguments[0])
				) {
					context.report({ node, messageId: 'preferLink', data: { name } })
				}
			},
		}
	},
}
