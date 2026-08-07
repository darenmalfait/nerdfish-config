import { getCallName } from '../util.js'

const DEFAULT_ALLOWED_WRAPPERS = ['useMountEffect']

function isEmptyDepsArray(node) {
	return node?.type === 'ArrayExpression' && node.elements.length === 0
}

function getFunctionName(node) {
	if (!node) {
		return null
	}

	if (node.type === 'FunctionDeclaration' && node.id?.type === 'Identifier') {
		return node.id.name
	}

	if (
		(node.type === 'FunctionExpression' ||
			node.type === 'ArrowFunctionExpression') &&
		node.id?.type === 'Identifier'
	) {
		return node.id.name
	}

	if (
		node.type === 'FunctionExpression' ||
		node.type === 'ArrowFunctionExpression'
	) {
		const { parent } = node

		if (
			parent?.type === 'VariableDeclarator' &&
			parent.id?.type === 'Identifier'
		) {
			return parent.id.name
		}
	}

	return null
}

function isInsideAllowedWrapper(node, allowedWrappers) {
	let current = node.parent

	while (current) {
		const name = getFunctionName(current)

		if (name != null && allowedWrappers.has(name)) {
			return true
		}

		current = current.parent
	}

	return false
}

export const noUseEffectRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow direct useEffect; allow it only inside allowlisted mount wrappers.',
			guidelineRuleId: 'react.no-use-effect',
		},

		schema: [
			{
				type: 'object',
				properties: {
					allowedWrappers: {
						type: 'array',
						items: {
							type: 'string',
							minLength: 1,
						},
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			noUseEffect:
				'`useEffect` is almost never the right tool: syncing with props/state usually means derived state (`useMemo`/`const`), user-driven work belongs in event handlers, and data fetching belongs in your router/framework (or a dedicated library). Do not reach for `useEffect` to "react to" renders. The rare exception is a true mount-only side effect (subscribe once, integrate an imperative API) — put that in `useMountEffect` (or another allowlisted wrapper) so the intent is explicit and this rule stays quiet.',
			preferUseMountEffect:
				'Empty-deps `useEffect(..., [])` is a mount-only effect. Call it via `useMountEffect` (or another allowlisted wrapper) instead of inlining `useEffect` — that keeps mount-only intent searchable and documents that a bare `useEffect` was a deliberate exception, not a habit.',
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const allowedWrappers = new Set(
			options.allowedWrappers ?? DEFAULT_ALLOWED_WRAPPERS,
		)

		return {
			CallExpression(node) {
				if (getCallName(node.callee) !== 'useEffect') {
					return
				}

				if (isInsideAllowedWrapper(node, allowedWrappers)) {
					return
				}

				const deps = node.arguments[1]
				const messageId = isEmptyDepsArray(deps)
					? 'preferUseMountEffect'
					: 'noUseEffect'

				context.report({
					node,
					messageId,
				})
			},
		}
	},
}
