export function getMemberPropertyName(callee) {
	if (
		callee?.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name
	}

	return null
}

/** Member name from identifier or computed string-literal property access. */
export function getResolvableMemberPropertyName(callee) {
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

export function getCallName(callee) {
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

export function isFunctionNode(node) {
	return (
		node?.type === 'FunctionExpression' ||
		node?.type === 'ArrowFunctionExpression'
	)
}

/** Static string from a literal or expression-less template node. */
export function resolveStaticStringValue(node, { trim = false } = {}) {
	if (node?.type === 'Literal' && typeof node.value === 'string') {
		return trim ? node.value.trim() : node.value
	}

	if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
		const value = node.quasis.map((quasi) => quasi.value.cooked ?? '').join('')
		return trim ? value.trim() : value
	}

	return null
}

/** First argument when it is a static string (literal or expression-less template). */
export function resolveStaticStringArg(callExpression) {
	const [firstArg] = callExpression?.arguments ?? []

	if (!firstArg) {
		return null
	}

	if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
		return { value: firstArg.value, node: firstArg }
	}

	if (
		firstArg.type === 'TemplateLiteral' &&
		firstArg.expressions.length === 0 &&
		firstArg.quasis.length === 1
	) {
		return { value: firstArg.quasis[0].value.cooked ?? '', node: firstArg }
	}

	return null
}

/** First argument when it is a function callback (beforeAll/afterEach style). */
export function getFirstCallback(callExpression) {
	const callback = callExpression?.arguments?.[0]
	return isFunctionNode(callback) ? callback : null
}

/** Second argument when it is a function callback (describe/it/Given/When style). */
export function getSecondCallback(callExpression) {
	const callback = callExpression?.arguments?.[1]
	return isFunctionNode(callback) ? callback : null
}

export function unwrapAwaitExpression(node) {
	return node?.type === 'AwaitExpression' ? node.argument : node
}

const CHILD_GETTERS = {
	ArrayExpression: (node) => node.elements,
	AwaitExpression: (node) => [node.argument],
	BinaryExpression: (node) => [node.left, node.right],
	BlockStatement: (node) => node.body,
	CallExpression: (node) => [node.callee, ...node.arguments],
	ConditionalExpression: (node) => [node.test, node.consequent, node.alternate],
	ExpressionStatement: (node) => [node.expression],
	IfStatement: (node) =>
		node.alternate
			? [node.test, node.consequent, node.alternate]
			: [node.test, node.consequent],
	LogicalExpression: (node) => [node.left, node.right],
	MemberExpression: (node) =>
		node.computed ? [node.object, node.property] : [node.object],
	NewExpression: (node) => [node.callee, ...node.arguments],
	ObjectExpression: (node) => node.properties,
	Property: (node) => [node.value],
	ReturnStatement: (node) => [node.argument],
	SpreadElement: (node) => [node.argument],
	SequenceExpression: (node) => node.expressions,
	UnaryExpression: (node) => [node.argument],
	UpdateExpression: (node) => [node.argument],
	VariableDeclaration: (node) => node.declarations,
	VariableDeclarator: (node) => (node.init ? [node.init] : []),
}

function listChildNodes(node) {
	const getter = CHILD_GETTERS[node.type]
	if (!getter) {
		return []
	}

	return getter(node).filter(
		(child) => child && typeof child === 'object' && child.type,
	)
}

function shouldSkipChildNode(child, options) {
	if (!child?.type) {
		return true
	}

	if (options.skipNestedFunctionBodies && isFunctionNode(child)) {
		return true
	}

	return false
}

function visitNode(node, visitor, options) {
	if (!node?.type || visitor(node)) {
		return true
	}

	if (node.type === 'CallExpression') {
		if (visitNode(node.callee, visitor, options)) {
			return true
		}

		const callName = getCallName(node.callee)
		const skipFunctionArgs =
			callName && options.omitFunctionArgsForCalls.has(callName)

		for (const argument of node.arguments ?? []) {
			if (
				(skipFunctionArgs && isFunctionNode(argument)) ||
				shouldSkipChildNode(argument, options)
			) {
				continue
			}
			if (visitNode(argument, visitor, options)) {
				return true
			}
		}
		return false
	}

	for (const child of listChildNodes(node)) {
		if (shouldSkipChildNode(child, options)) {
			continue
		}
		if (visitNode(child, visitor, options)) {
			return true
		}
	}

	return false
}

/**
 * Walk an ESTree subtree. Return true from the visitor to stop immediately.
 * Skips function-valued arguments on calls whose names are listed in omitFunctionArgsForCalls.
 * Skips nested function bodies when skipNestedFunctionBodies is true.
 */
export function walkAst(
	root,
	visitor,
	{
		omitFunctionArgsForCalls = new Set(),
		skipNestedFunctionBodies = false,
	} = {},
) {
	visitNode(root, visitor, {
		omitFunctionArgsForCalls,
		skipNestedFunctionBodies,
	})
}

export function subtreeMatches(root, predicate, walkOptions = {}) {
	let matched = false

	walkAst(
		root,
		(node) => {
			if (predicate(node)) {
				matched = true
				return true
			}
			return false
		},
		walkOptions,
	)

	return matched
}
