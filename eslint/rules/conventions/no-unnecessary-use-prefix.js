import { getCallName, isFunctionNode, subtreeMatches } from '../util.js'

/** Hooks that look like `use*` but are not React hooks (allow empty / non-hook bodies). */
const WELL_KNOWN_HOOKS = new Set(['useMDXComponents'])

const USE_PREFIX_PATTERN = /^use[A-Z]/

function isUsePrefixedName(name) {
	return USE_PREFIX_PATTERN.test(name)
}

function isHookCallName(name) {
	return name != null && USE_PREFIX_PATTERN.test(name)
}

function isFunctionEmpty(node) {
	if (!node) {
		return true
	}

	if (node.type === 'ArrowFunctionExpression') {
		if (node.expression) {
			return false
		}

		return node.body?.type === 'BlockStatement' && node.body.body.length === 0
	}

	return node.body?.type === 'BlockStatement' && node.body.body.length === 0
}

function containsUseComments(context, node) {
	return context.sourceCode
		.getCommentsInside(node)
		.some(
			({ value }) =>
				/use\([\s\S]*?\)/u.test(value) ||
				/use[A-Z0-9]\w*\([\s\S]*?\)/u.test(value),
		)
}

function isTestMockCall(callee) {
	if (callee?.type !== 'MemberExpression') {
		return false
	}

	if (callee.object?.type !== 'Identifier') {
		return false
	}

	if (callee.property?.type !== 'Identifier') {
		return false
	}

	return (
		callee.property.name === 'mock' &&
		(callee.object.name === 'jest' || callee.object.name === 'vi')
	)
}

function isTestMockCallback(node) {
	if (!isFunctionNode(node)) {
		return false
	}

	const { parent } = node

	if (parent?.type !== 'CallExpression') {
		return false
	}

	if (!isTestMockCall(parent.callee)) {
		return false
	}

	return parent.arguments[1] === node
}

function findParent(node, predicate) {
	let current = node?.parent ?? null

	while (current) {
		if (predicate(current)) {
			return current
		}

		current = current.parent
	}

	return null
}

function functionCallsHook(functionNode, ownName) {
	const root = functionNode.body ?? functionNode

	return subtreeMatches(
		root,
		(node) => {
			if (node.type !== 'CallExpression') {
				return false
			}

			const callName = getCallName(node.callee)

			return (
				callName != null &&
				callName !== ownName &&
				isHookCallName(callName)
			)
		},
		{ skipNestedFunctionBodies: true },
	)
}

export const noUnnecessaryUsePrefixRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				"Disallow the 'use' prefix on functions that do not call another hook.",
			guidelineRuleId: 'react.no-unnecessary-use-prefix',
		},

		schema: [],

		messages: {
			unnecessaryUsePrefix:
				"Function '{{name}}' does not call any hooks. Drop the 'use' prefix or call a hook inside it.",
		},
	},

	create(context) {
		/** @type {{ id: import('estree').Identifier | null, node: import('estree').Node, name: string }[]} */
		const usePrefixedFunctions = []

		function registerUsePrefixedFunction(id, node, name) {
			usePrefixedFunctions.push({ id, node, name })
		}

		return {
			FunctionDeclaration(node) {
				if (node.id && isUsePrefixedName(node.id.name)) {
					registerUsePrefixedFunction(node.id, node, node.id.name)
				}
			},

			VariableDeclarator(node) {
				if (
					node.id?.type === 'Identifier' &&
					isUsePrefixedName(node.id.name) &&
					isFunctionNode(node.init)
				) {
					registerUsePrefixedFunction(node.id, node.init, node.id.name)
				}
			},

			'Program:exit'() {
				for (const { id, node, name } of usePrefixedFunctions) {
					if (functionCallsHook(node, name)) {
						continue
					}

					if (isFunctionEmpty(node)) {
						continue
					}

					if (WELL_KNOWN_HOOKS.has(name)) {
						continue
					}

					if (containsUseComments(context, node)) {
						continue
					}

					if (findParent(node, isTestMockCallback)) {
						continue
					}

					context.report({
						node: id ?? node,
						messageId: 'unnecessaryUsePrefix',
						data: { name },
					})
				}
			},
		}
	},
}
