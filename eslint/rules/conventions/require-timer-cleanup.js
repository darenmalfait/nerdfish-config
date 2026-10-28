import { getCallName, isFunctionNode } from '../util.js'

const EFFECT_HOOKS = new Set(['useEffect', 'useLayoutEffect'])

const CLEAR_BY_TIMER = new Map([
	['requestAnimationFrame', 'cancelAnimationFrame'],
	['requestIdleCallback', 'cancelIdleCallback'],
	['setInterval', 'clearInterval'],
	['setTimeout', 'clearTimeout'],
])

const CLEARS = new Set(CLEAR_BY_TIMER.values())

function getEnclosingFunction(node) {
	for (let current = node.parent; current; current = current.parent) {
		if (isFunctionNode(current) || current.type === 'FunctionDeclaration') {
			return current
		}
	}

	return null
}

function isWithin(node, container) {
	return (
		node.range[0] >= container.range[0] && node.range[1] <= container.range[1]
	)
}

/** Text of what the timer id is stored in: `id` in `const id = setTimeout(…)`, `timer.current` in `timer.current = setTimeout(…)`. */
function getTimerIdTarget(sourceCode, call) {
	const { parent } = call

	if (parent.type === 'VariableDeclarator' && parent.init === call) {
		return sourceCode.getText(parent.id)
	}

	if (parent.type === 'AssignmentExpression' && parent.right === call) {
		return sourceCode.getText(parent.left)
	}

	return null
}

/** `return () => …` → that function; `return cleanup` → the local function it names. */
function resolveCleanup(sourceCode, argument) {
	if (isFunctionNode(argument)) {
		return argument
	}

	if (argument?.type !== 'Identifier') {
		return null
	}

	const definition = sourceCode
		.getScope(argument)
		.references.find((reference) => reference.identifier === argument)?.resolved
		?.defs[0]?.node

	if (definition?.type === 'FunctionDeclaration') {
		return definition
	}

	return isFunctionNode(definition?.init) ? definition.init : null
}

export const requireTimerCleanupRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Require timers started in an effect to be cleared in its cleanup.',
			url: 'https://github.com/WordPress/gutenberg/blob/trunk/packages/eslint-plugin/docs/rules/react-no-unsafe-timeout.md',
		},

		schema: [],

		messages: {
			missingCleanup:
				'`{{timer}}` keeps running after unmount or when the effect re-runs. Store its id and call `{{clear}}(id)` in the cleanup the effect returns.',
		},
	},

	create(context) {
		const { sourceCode } = context

		/** Effect callback → the timers it starts and the cleanups it returns. */
		const effects = new Map()
		const clearCalls = []

		/**
		 * Checks:
		 * useEffect(() => {
		 *   const id = setTimeout(close, 300)
		 *   return () => clearTimeout(id)
		 * }) ✅
		 * useEffect(() => {
		 *   timer.current = setInterval(poll, 1000)
		 *   return () => clearInterval(timer.current)
		 * }) ✅
		 * useEffect(() => {
		 *   setTimeout(close, 300)
		 * }) ❌
		 * useEffect(() => {
		 *   const id = setTimeout(close, 300)
		 * }) ❌ (never cleared)
		 */
		return {
			CallExpression(node) {
				const name = getCallName(node.callee)

				if (EFFECT_HOOKS.has(name) && isFunctionNode(node.arguments[0])) {
					effects.set(node.arguments[0], { timers: [], cleanups: [] })
					return
				}

				if (CLEARS.has(name)) {
					clearCalls.push(node)
					return
				}

				// Only timers the effect body starts itself: ones in nested
				// callbacks (listeners, the cleanup) have their own lifecycle.
				const effect = CLEAR_BY_TIMER.has(name)
					? effects.get(getEnclosingFunction(node))
					: null

				effect?.timers.push(node)
			},

			ReturnStatement(node) {
				const effect = effects.get(getEnclosingFunction(node))
				const cleanup = effect && resolveCleanup(sourceCode, node.argument)

				if (cleanup) {
					effect.cleanups.push(cleanup)
				}
			},

			'CallExpression:exit'(node) {
				const effect = effects.get(node.arguments[0])

				if (!EFFECT_HOOKS.has(getCallName(node.callee)) || !effect) {
					return
				}

				for (const timer of effect.timers) {
					const timerName = getCallName(timer.callee)
					const clear = CLEAR_BY_TIMER.get(timerName)
					const target = getTimerIdTarget(sourceCode, timer)

					const isCleared =
						target != null &&
						clearCalls.some(
							(call) =>
								getCallName(call.callee) === clear &&
								call.arguments[0] &&
								sourceCode.getText(call.arguments[0]) === target &&
								effect.cleanups.some((cleanup) => isWithin(call, cleanup)),
						)

					if (!isCleared) {
						context.report({
							node: timer,
							messageId: 'missingCleanup',
							data: { timer: timerName, clear },
						})
					}
				}
			},
		}
	},
}
