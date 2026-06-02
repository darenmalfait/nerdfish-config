import {
	getCallName,
	getMemberPropertyName,
	getResolvableMemberPropertyName,
	getSecondCallback,
	isFunctionNode,
	resolveStaticStringValue,
	subtreeMatches,
	unwrapAwaitExpression,
	walkAst,
} from '../../util.js'

export const RTL_QUERY_NAME_PATTERN = /^(get|find|query)(All)?By[A-Z]/
export const FIND_QUERY_NAME_PATTERN = /^find(All)?By[A-Z]/

export function isWithinCall(node) {
	return (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'Identifier' &&
		node.callee.name === 'within'
	)
}

export function isJestMemberCall(node, methodName) {
	const callee = node?.callee
	return (
		node?.type === 'CallExpression' &&
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object?.type === 'Identifier' &&
		callee.object.name === 'jest' &&
		callee.property?.type === 'Identifier' &&
		callee.property.name === methodName
	)
}

export function isScreenOrWithinQuery(
	node,
	propertyPattern = RTL_QUERY_NAME_PATTERN,
) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const propertyName = getMemberPropertyName(node.callee)
	if (!propertyName || !propertyPattern.test(propertyName)) {
		return false
	}

	const object = node.callee.object
	return (
		(object?.type === 'Identifier' &&
			['screen', 'container'].includes(object.name)) ||
		isWithinCall(object)
	)
}

export function isQueryScopedWithin(node) {
	const object = node?.callee?.object
	return object?.type === 'CallExpression' && isWithinCall(object)
}

export function getEnclosingFunction(node) {
	let current = node?.parent ?? null

	while (current) {
		if (isFunctionNode(current) || current.type === 'FunctionDeclaration') {
			return current
		}

		current = current.parent
	}

	return null
}

export function getOwningTestCallbackName(node) {
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

export function allowsStoredQueryBinding(node) {
	const enclosingFunction = getEnclosingFunction(node)
	if (!enclosingFunction) {
		return false
	}

	const owningCallbackName = getOwningTestCallbackName(node)
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

export function getObjectProperty(objectExpression, propertyName) {
	if (objectExpression?.type !== 'ObjectExpression') {
		return null
	}

	return (
		objectExpression.properties.find((property) => {
			if (property.type !== 'Property' || property.computed) {
				return false
			}

			if (property.key.type === 'Identifier') {
				return property.key.name === propertyName
			}

			return (
				property.key.type === 'Literal' && property.key.value === propertyName
			)
		}) ?? null
	)
}

export function isLikelyTranslationKey(value) {
	return /^[a-z0-9]+(?:[._-][a-z0-9]+)+$/i.test(value)
}

export function factoryReturnsNonEmptyObject(factory) {
	if (factory.body.type === 'ObjectExpression') {
		return factory.body.properties.length > 0
	}

	if (factory.body.type !== 'BlockStatement') {
		return false
	}

	for (const statement of factory.body.body) {
		if (statement.type !== 'ReturnStatement') {
			continue
		}
		const argument = statement.argument
		if (argument?.type === 'ObjectExpression') {
			return argument.properties.length > 0
		}
	}

	return false
}

export function factoryUsesJestRequireActual(factory) {
	return subtreeMatches(
		factory.body,
		(node) => isJestMemberCall(node, 'requireActual'),
		{ skipNestedFunctionBodies: true },
	)
}

export function createBannedMemberQueryRule({
	guidelineRuleId,
	description,
	messageId,
	message,
	bannedNames,
	exclude,
}) {
	return {
		meta: {
			type: 'problem',
			docs: { description, guidelineRuleId },
			schema: [],
			messages: { [messageId]: message },
		},
		create(context) {
			return {
				CallExpression(node) {
					const queryName = getMemberPropertyName(node.callee)
					if (!bannedNames.has(queryName)) {
						return
					}

					if (exclude?.(node, queryName)) {
						return
					}

					context.report({
						node,
						messageId,
						data: { queryName, methodName: queryName },
					})
				},
			}
		},
	}
}

export {
	getMemberPropertyName,
	getResolvableMemberPropertyName,
	getSecondCallback,
	resolveStaticStringValue,
	unwrapAwaitExpression,
	walkAst,
}
