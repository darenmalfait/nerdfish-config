import { getMemberPropertyName, isFunctionNode } from '../util.js'

function findFunction(scope, name) {
	for (let current = scope; current; current = current.upper) {
		const definition = current.set.get(name)?.defs[0]

		if (!definition) {
			continue
		}

		if (definition.node.type === 'FunctionDeclaration') {
			return definition.node
		}

		return isFunctionNode(definition.node.init) ? definition.node.init : null
	}

	return null
}

function callsPreventDefault(fn, visitorKeys) {
	let isFound = false

	function visit(node) {
		if (isFound || !node?.type) {
			return
		}

		if (
			node.type === 'CallExpression' &&
			getMemberPropertyName(node.callee) === 'preventDefault'
		) {
			isFound = true
			return
		}

		for (const key of visitorKeys[node.type] ?? []) {
			const value = node[key]

			for (const child of Array.isArray(value) ? value : [value]) {
				visit(child)
			}
		}
	}

	visit(fn.body)

	return isFound
}

export const noPasteBlockingRule = {
	meta: {
		type: 'problem',

		docs: {
			description: 'Disallow onPaste handlers that call preventDefault().',
			guidelineRuleId: 'web-interface-guidelines.forms',
		},

		schema: [],

		messages: {
			noPasteBlocking:
				'Blocking paste breaks password managers and assistive tech, and frustrates users. Let the paste through and validate the value instead.',
		},
	},

	create(context) {
		const { sourceCode } = context

		/**
		 * Checks:
		 * <input onPaste={handlePaste} /> where handlePaste only reads ✅
		 * <input onPaste={(event) => event.preventDefault()} /> ❌
		 * <input onPaste={handlePaste} /> where handlePaste calls preventDefault ❌
		 */
		return {
			JSXAttribute(node) {
				if (
					node.name.type !== 'JSXIdentifier' ||
					node.name.name !== 'onPaste' ||
					node.value?.type !== 'JSXExpressionContainer'
				) {
					return
				}

				const { expression } = node.value
				const handler = isFunctionNode(expression)
					? expression
					: expression.type === 'Identifier'
						? findFunction(sourceCode.getScope(expression), expression.name)
						: null

				if (handler && callsPreventDefault(handler, sourceCode.visitorKeys)) {
					context.report({ node, messageId: 'noPasteBlocking' })
				}
			},
		}
	},
}
