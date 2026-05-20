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

const CHILD_GETTERS = {
	ArrayExpression: (node) => node.elements,
	AwaitExpression: (node) => [node.argument],
	BinaryExpression: (node) => [node.left, node.right],
	BlockStatement: (node) => node.body,
	CallExpression: (node) => [node.callee, ...node.arguments],
	ConditionalExpression: (node) => [
		node.test,
		node.consequent,
		node.alternate,
	],
	ExpressionStatement: (node) => [node.expression],
	IfStatement: (node) =>
		node.alternate
			? [node.test, node.consequent, node.alternate]
			: [node.test, node.consequent],
	LogicalExpression: (node) => [node.left, node.right],
	MemberExpression: (node) =>
		node.computed ? [node.object, node.property] : [node.object],
	NewExpression: (node) => [node.callee, ...node.arguments],
	ReturnStatement: (node) => [node.argument],
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

function visitNode(node, visitor, omitFunctionArgsForCalls) {
	if (!node?.type || visitor(node)) {
		return true
	}

	if (node.type === 'CallExpression') {
		if (visitNode(node.callee, visitor, omitFunctionArgsForCalls)) {
			return true
		}

		const callName = getCallName(node.callee)
		const skipFunctionArgs =
			callName && omitFunctionArgsForCalls.has(callName)

		for (const argument of node.arguments ?? []) {
			if (skipFunctionArgs && isFunctionNode(argument)) {
				continue
			}
			if (visitNode(argument, visitor, omitFunctionArgsForCalls)) {
				return true
			}
		}
		return false
	}

	for (const child of listChildNodes(node)) {
		if (visitNode(child, visitor, omitFunctionArgsForCalls)) {
			return true
		}
	}

	return false
}

/**
 * Walk an ESTree subtree. Return true from the visitor to stop immediately.
 * Skips function-valued arguments on calls whose names are listed in omitFunctionArgsForCalls.
 */
export function walkAst(
	root,
	visitor,
	{ omitFunctionArgsForCalls = new Set() } = {},
) {
	visitNode(root, visitor, omitFunctionArgsForCalls)
}
