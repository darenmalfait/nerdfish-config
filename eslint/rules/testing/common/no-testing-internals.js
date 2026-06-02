// Guideline registry id: no-testing-internals
import {
	getResolvableMemberPropertyName,
	resolveStaticStringValue,
	subtreeMatches,
} from '../../util.js'

const INTERNAL_ASSERTION_METHODS = new Set(['toHaveClass', 'toHaveClassName'])
const INTERNAL_ATTRIBUTE_ASSERTION_METHOD = 'toHaveAttribute'
const INTERNAL_STATE_OWNER_REGEX = /^(component|wrapper|instance|vm)$/i
const INTERNAL_DOM_PROPERTY_NAMES = new Set(['classList', 'className'])
const INTERNAL_OWNER_PROPERTY_NAMES = new Set(['props', 'state'])
const INTERNAL_ATTRIBUTE_NAMES = new Set(['class', 'classname', 'style'])

function looksLikeInternalStateOwner(node) {
	if (node?.type === 'Identifier') {
		return INTERNAL_STATE_OWNER_REGEX.test(node.name)
	}

	if (
		node?.type === 'CallExpression' &&
		node.callee?.type === 'MemberExpression'
	) {
		const calleeName = getResolvableMemberPropertyName(node.callee)
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

	const propertyName = getResolvableMemberPropertyName(node)
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

	const methodName = getResolvableMemberPropertyName(node.callee)
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
		const attributeName = resolveStaticStringValue(
			node.arguments[0],
		)?.toLowerCase()
		return Boolean(attributeName && INTERNAL_ATTRIBUTE_NAMES.has(attributeName))
	}

	if (
		methodName === 'contains' &&
		node.callee.object?.type === 'MemberExpression'
	) {
		return getResolvableMemberPropertyName(node.callee.object) === 'classList'
	}

	return false
}

function expressionUsesImplementationDetails(node) {
	return (
		isImplementationDetailMemberAccess(node) ||
		isImplementationDetailCallAccess(node)
	)
}

function isImplementationDetailAttributeAssertion(node, matcherName) {
	if (matcherName !== INTERNAL_ATTRIBUTE_ASSERTION_METHOD) {
		return false
	}

	const attributeName = resolveStaticStringValue(
		node.arguments[0],
	)?.toLowerCase()
	return Boolean(attributeName && INTERNAL_ATTRIBUTE_NAMES.has(attributeName))
}

export const noTestingInternalsRule = {
	meta: {
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
	},
	create(context) {
		return {
			CallExpression(node) {
				const matcherName = getResolvableMemberPropertyName(node.callee)

				if (
					INTERNAL_ASSERTION_METHODS.has(matcherName) ||
					isImplementationDetailAttributeAssertion(node, matcherName)
				) {
					context.report({
						node,
						messageId: 'noTestingInternals',
					})
					return
				}

				if (
					node.callee?.type !== 'Identifier' ||
					node.callee.name !== 'expect'
				) {
					return
				}

				const [subject] = node.arguments
				if (!subtreeMatches(subject, expressionUsesImplementationDetails)) {
					return
				}

				context.report({
					node: subject ?? node,
					messageId: 'noTestingInternals',
				})
			},
		}
	},
}
