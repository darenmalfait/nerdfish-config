// Guideline registry id: no-testing-internals
const meta = {
	type: 'problem',
	docs: {
		description:
			'Disallow assertions that rely on implementation details such as class names or component state.',
		guidelineRuleId: 'no-testing-internals',
	},
	schema: [],
	messages: {
		noTestingInternals:
			'Avoid implementation-detail assertions in tests (for example class names or component state). Assert user-visible or accessible behavior instead.',
	},
}

const INTERNAL_ASSERTION_METHODS = new Set(['toHaveClass', 'toHaveClassName'])
const INTERNAL_ATTRIBUTE_ASSERTION_METHOD = 'toHaveAttribute'
const INTERNAL_STATE_OWNER_REGEX = /^(component|wrapper|instance|vm)$/i
const INTERNAL_DOM_PROPERTY_NAMES = new Set(['classList', 'className'])
const INTERNAL_OWNER_PROPERTY_NAMES = new Set(['props', 'state'])
const INTERNAL_ATTRIBUTE_NAMES = new Set(['class', 'classname', 'style'])

function getMemberPropertyName(callee) {
	if (callee?.type !== 'MemberExpression') {
		return null
	}

	if (!callee.computed && callee.property.type === 'Identifier') {
		return callee.property.name
	}

	if (
		callee.computed &&
		callee.property.type === 'Literal' &&
		typeof callee.property.value === 'string'
	) {
		return callee.property.value
	}

	return null
}

function getStaticStringValue(node) {
	if (node?.type === 'Literal' && typeof node.value === 'string') {
		return node.value
	}

	if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
		return node.quasis.map((quasi) => quasi.value.cooked ?? '').join('')
	}

	return null
}

function looksLikeInternalStateOwner(node) {
	if (node?.type === 'Identifier') {
		return INTERNAL_STATE_OWNER_REGEX.test(node.name)
	}

	if (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'MemberExpression'
	) {
		const calleeName = getMemberPropertyName(node.callee)
		if (calleeName === 'instance' || calleeName === 'getInstance') {
			return looksLikeInternalStateOwner(node.callee.object)
		}
	}

	return false
}

function isImplementationDetailMemberAccess(node) {
	if (node?.type !== 'MemberExpression') {
		return false
	}

	const propertyName = getMemberPropertyName(node)
	if (!propertyName) {
		return false
	}

	if (INTERNAL_DOM_PROPERTY_NAMES.has(propertyName)) {
		return true
	}

	return (
		INTERNAL_OWNER_PROPERTY_NAMES.has(propertyName) &&
		looksLikeInternalStateOwner(node.object)
	)
}

function isImplementationDetailCallAccess(node) {
	if (
		node?.type !== 'CallExpression' ||
		node.callee?.type !== 'MemberExpression'
	) {
		return false
	}

	const methodName = getMemberPropertyName(node.callee)
	if (!methodName) {
		return false
	}

	if (
		(methodName === 'state' || methodName === 'props') &&
		looksLikeInternalStateOwner(node.callee.object)
	) {
		return true
	}

	if (methodName === 'getAttribute') {
		const attributeName = getStaticStringValue(node.arguments[0])?.toLowerCase()
		return Boolean(attributeName && INTERNAL_ATTRIBUTE_NAMES.has(attributeName))
	}

	if (
		methodName === 'contains' &&
		node.callee.object?.type === 'MemberExpression'
	) {
		return getMemberPropertyName(node.callee.object) === 'classList'
	}

	return false
}

function enqueueTraversalTargets(stack, value) {
	if (!value) {
		return
	}

	if (Array.isArray(value)) {
		for (const item of value) {
			if (item && typeof item === 'object') {
				stack.push(item)
			}
		}
		return
	}

	if (
		typeof value === 'object' &&
		typeof value.type === 'string'
	) {
		stack.push(value)
	}
}

function hasInternalStateAccess(node) {
	const stack = [node]
	const seen = new Set()

	while (stack.length > 0) {
		const current = stack.pop()
		if (!current || typeof current !== 'object' || seen.has(current)) {
			continue
		}
		seen.add(current)

		if (
			isImplementationDetailMemberAccess(current) ||
			isImplementationDetailCallAccess(current)
		) {
			return true
		}

		for (const value of Object.values(current)) {
			enqueueTraversalTargets(stack, value)
		}
	}

	return false
}

function isImplementationDetailAttributeAssertion(
	node,
	matcherName,
) {
	if (matcherName !== INTERNAL_ATTRIBUTE_ASSERTION_METHOD) {
		return false
	}

	const [attributeNameNode] = node.arguments
	const attributeName = getStaticStringValue(attributeNameNode)?.toLowerCase()
	return Boolean(attributeName && INTERNAL_ATTRIBUTE_NAMES.has(attributeName))
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				const calleeName = getMemberPropertyName(node.callee)

				if (
					INTERNAL_ASSERTION_METHODS.has(calleeName) ||
					isImplementationDetailAttributeAssertion(node, calleeName)
				) {
					context.report({
						node,
						messageId: 'noTestingInternals',
					})
					return
				}

				if (
					node.callee?.type === 'Identifier' &&
					node.callee.name === 'expect'
				) {
					const [firstArg] = node.arguments
					if (!hasInternalStateAccess(firstArg)) {
						return
					}

					context.report({
						node: firstArg ?? node,
						messageId: 'noTestingInternals',
					})
				}
			},
		}
	},
}

export default rule
