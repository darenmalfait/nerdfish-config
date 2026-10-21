import { getCallName, isFunctionNode } from '../util.js'

const DEFAULT_HOOKS = ['useSearchParams']
const MEMOIZED_CALLBACK_HOOKS = new Set(['useCallback', 'useEffectEvent'])

function isEventHandlerName(name) {
	return /^handle[A-Z]/.test(name)
}

function isFunctionLike(node) {
	return isFunctionNode(node) || node.type === 'FunctionDeclaration'
}

/** Name a function is bound to: `function handleX`, `const handleX = () => …`, `const handleX = useCallback(() => …)`. */
function getBindingName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name ?? null
	}

	let { parent } = fn

	if (
		parent.type === 'CallExpression' &&
		MEMOIZED_CALLBACK_HOOKS.has(getCallName(parent.callee)) &&
		parent.arguments[0] === fn
	) {
		parent = parent.parent
	}

	return parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier'
		? parent.id.name
		: null
}

/** Inline `on*={() => …}` JSX handler, or a function bound to a handle* name. */
function isEventHandler(fn) {
	const { parent } = fn

	if (
		parent.type === 'JSXExpressionContainer' &&
		parent.parent.type === 'JSXAttribute' &&
		parent.parent.name.type === 'JSXIdentifier' &&
		/^on[A-Z]/.test(parent.parent.name.name)
	) {
		return true
	}

	const name = getBindingName(fn)

	return name !== null && isEventHandlerName(name)
}

/** `[dep]` in `useCallback(handler, [dep])` where the callback is an event handler. */
function isEventHandlerDependency(identifier) {
	const deps = identifier.parent
	const call = deps.parent

	return (
		deps.type === 'ArrayExpression' &&
		call?.type === 'CallExpression' &&
		MEMOIZED_CALLBACK_HOOKS.has(getCallName(call.callee)) &&
		call.arguments[1] === deps &&
		isFunctionNode(call.arguments[0]) &&
		isEventHandler(call.arguments[0])
	)
}

/** True when the reference sits inside an event handler nested in `owner`. */
function isReadInEventHandler(identifier, owner) {
	if (isEventHandlerDependency(identifier)) {
		return true
	}

	for (
		let current = identifier.parent;
		current && current !== owner;
		current = current.parent
	) {
		if (isFunctionLike(current) && isEventHandler(current)) {
			return true
		}
	}

	return false
}

function getEnclosingFunction(node) {
	let current = node.parent

	while (current && !isFunctionLike(current)) {
		current = current.parent
	}

	return current
}

export const noCallbackOnlySubscriptionRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow subscribing to dynamic state that is only read inside event handlers.',
			guidelineRuleId: 'rerender-defer-reads',
		},

		schema: [
			{
				type: 'object',
				properties: {
					hooks: {
						type: 'array',
						items: { type: 'string', minLength: 1 },
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			noCallbackOnlySubscription:
				'`{{name}}` from `{{hook}}()` is only read in event handlers, yet the component re-renders whenever it changes. Read it on demand inside the handler instead (e.g. `new URLSearchParams(window.location.search)`).',
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const hooks = new Set(options.hooks ?? DEFAULT_HOOKS)

		/**
		 * Checks:
		 * const searchParams = useSearchParams(); return <p>{searchParams.get('q')}</p> ✅
		 * handleShare reads new URLSearchParams(window.location.search) ✅
		 * const searchParams = useSearchParams(); function handleShare() { searchParams.get('ref') } ❌
		 */
		return {
			VariableDeclarator(declarator) {
				const { id, init } = declarator

				if (
					id.type !== 'Identifier' ||
					init?.type !== 'CallExpression' ||
					!hooks.has(getCallName(init.callee))
				) {
					return
				}

				const [variable] = context.sourceCode.getDeclaredVariables(declarator)
				const owner = getEnclosingFunction(declarator)
				const reads = variable.references.filter(
					(reference) => reference.identifier !== id,
				)

				if (
					!owner ||
					reads.length === 0 ||
					!reads.every((reference) =>
						isReadInEventHandler(reference.identifier, owner),
					)
				) {
					return
				}

				context.report({
					node: declarator,
					messageId: 'noCallbackOnlySubscription',
					data: { name: id.name, hook: getCallName(init.callee) },
				})
			},
		}
	},
}
