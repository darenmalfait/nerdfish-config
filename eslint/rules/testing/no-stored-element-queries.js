// Guideline registry id: no-stored-element-queries
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow stale element references across test phases; prefer getter functions.',
		guidelineRuleId: 'no-stored-element-queries',
	},
	schema: [],
	messages: {
		noStoredElementQuery:
			'Avoid storing queried elements across test phases. Prefer getter functions so tests always use a fresh DOM query.',
	},
}

function getMemberPropertyName(callee) {
	if (
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name
	}

	return null
}

function isWithinCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'within'
	)
}

function getCallName(callee) {
	if (!callee) {
		return null
	}

	if (callee.type === 'Identifier') {
		return callee.name
	}

	if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name
	}

	return null
}

function isElementQueryCall(node) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const propertyName = getMemberPropertyName(node.callee)
	if (!propertyName || !/^(get|find|query)(All)?By[A-Z]/.test(propertyName)) {
		return false
	}

	const object = node.callee.object

	return (
		(object?.type === 'Identifier' &&
			['screen', 'container'].includes(object.name)) ||
		isWithinCall(object)
	)
}

function unwrapQueryExpression(node) {
	if (node?.type === 'AwaitExpression') {
		return node.argument
	}

	return node
}

function getEnclosingFunction(node) {
	let current = node?.parent ?? null

	while (current) {
		if (
			current.type === 'FunctionExpression' ||
			current.type === 'ArrowFunctionExpression' ||
			current.type === 'FunctionDeclaration'
		) {
			return current
		}

		current = current.parent
	}

	return null
}

function getOwningCallbackName(node) {
	const enclosingFunction = getEnclosingFunction(node)
	if (
		!enclosingFunction ||
		enclosingFunction.parent?.type !== 'CallExpression'
	) {
		return null
	}

	const callExpression = enclosingFunction.parent
	if (!callExpression.arguments.includes(enclosingFunction)) {
		return null
	}

	return getCallName(callExpression.callee)
}

function isConstVariableDeclarator(node) {
	return (
		node?.parent?.type === 'VariableDeclaration' && node.parent.kind === 'const'
	)
}

function shouldIgnoreVariableDeclarator(node) {
	const enclosingFunction = getEnclosingFunction(node)
	if (!enclosingFunction) {
		return false
	}

	const owningCallbackName = getOwningCallbackName(node)
	if (!owningCallbackName) {
		return true
	}

	if (owningCallbackName === 'it' || owningCallbackName === 'test') {
		return true
	}

	if (owningCallbackName === 'beforeEach') {
		return isConstVariableDeclarator(node)
	}

	return false
}

const rule = {
	meta,
	create(context) {
		return {
			VariableDeclarator(node) {
				if (node.id.type !== 'Identifier') {
					return
				}

				const init = unwrapQueryExpression(node.init)

				if (!isElementQueryCall(init)) {
					return
				}

				if (shouldIgnoreVariableDeclarator(node)) {
					return
				}

				context.report({
					node,
					messageId: 'noStoredElementQuery',
				})
			},
			AssignmentExpression(node) {
				if (node.operator !== '=' || node.left?.type !== 'Identifier') {
					return
				}

				const right = unwrapQueryExpression(node.right)
				if (!isElementQueryCall(right)) {
					return
				}

				if (shouldIgnoreVariableDeclarator(node)) {
					return
				}

				context.report({
					node,
					messageId: 'noStoredElementQuery',
				})
			},
		}
	},
}

export default rule
