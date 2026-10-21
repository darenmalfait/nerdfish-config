import { createRequire } from 'node:module'
import path from 'node:path'

import { getCallName, isFunctionNode } from '../util.js'

const reactMajorByCwd = new Map()

/** Major version of the project's installed React, or null if unresolvable. */
function getReactMajor(cwd) {
	if (!reactMajorByCwd.has(cwd)) {
		let major = null

		try {
			const require = createRequire(path.join(cwd, 'package.json'))
			major = Number.parseInt(require('react/package.json').version, 10)
		} catch {
			// React not installed; leave unknown.
		}

		reactMajorByCwd.set(cwd, major)
	}

	return reactMajorByCwd.get(cwd)
}

function getEnclosingFunction(node) {
	let current = node.parent

	while (
		current &&
		!isFunctionNode(current) &&
		current.type !== 'FunctionDeclaration'
	) {
		current = current.parent
	}

	return current
}

function isBooleanCall(reference, value) {
	const call = reference.identifier.parent
	const [argument] = call.arguments ?? []

	return (
		call.type === 'CallExpression' &&
		call.callee === reference.identifier &&
		call.arguments.length === 1 &&
		argument.type === 'Literal' &&
		argument.value === value
	)
}

export const preferUseTransitionRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Prefer useTransition over a manual boolean loading state around an await.',
			guidelineRuleId: 'rendering-usetransition-loading',
		},

		schema: [],

		messages: {
			preferUseTransition:
				'`{{setter}}(true)` … `await` … `{{setter}}(false)` is a hand-rolled pending flag. Use `const [isPending, startTransition] = useTransition()` and `startTransition(async () => { … })`: React tracks pending state, keeps the UI responsive, and cannot leave the flag stuck on errors.',
		},
	},

	create(context) {
		const reactMajor = getReactMajor(context.cwd)

		// Async transitions need React 19.
		if (reactMajor !== null && reactMajor < 19) {
			return {}
		}

		const setters = []
		const awaits = []

		function hasAwaitBetween(fn, from, to) {
			return awaits.some(
				(node) =>
					getEnclosingFunction(node) === fn &&
					node.range[0] > from &&
					node.range[1] < to,
			)
		}

		/**
		 * Checks:
		 * startTransition(async () => { await save() }) ✅
		 * setIsOpen(true) without an await before setIsOpen(false) ✅
		 * setIsLoading(true); await save(); setIsLoading(false) ❌
		 * setIsLoading(true); try { await save() } finally { setIsLoading(false) } ❌
		 */
		return {
			AwaitExpression(node) {
				awaits.push(node)
			},

			VariableDeclarator(declarator) {
				const { id, init } = declarator

				if (
					id.type !== 'ArrayPattern' ||
					id.elements[1]?.type !== 'Identifier' ||
					init?.type !== 'CallExpression' ||
					getCallName(init.callee) !== 'useState' ||
					init.arguments[0]?.type !== 'Literal' ||
					init.arguments[0].value !== false
				) {
					return
				}

				const setter = context.sourceCode
					.getDeclaredVariables(declarator)
					.find((variable) => variable.name === id.elements[1].name)

				if (setter) {
					setters.push(setter)
				}
			},

			'Program:exit'() {
				for (const setter of setters) {
					const ends = setter.references.filter((reference) =>
						isBooleanCall(reference, false),
					)

					for (const start of setter.references) {
						if (!isBooleanCall(start, true)) {
							continue
						}

						const fn = getEnclosingFunction(start.identifier)

						if (!fn?.async) {
							continue
						}

						const isHandRolled = ends.some(
							(end) =>
								getEnclosingFunction(end.identifier) === fn &&
								hasAwaitBetween(
									fn,
									start.identifier.range[1],
									end.identifier.range[0],
								),
						)

						if (!isHandRolled) {
							continue
						}

						context.report({
							node: start.identifier.parent,
							messageId: 'preferUseTransition',
							data: { setter: setter.name },
						})
					}
				}
			},
		}
	},
}
