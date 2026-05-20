// Guideline registry id: testing.spec.partial-mocks.use-jest-require-actual
const meta = {
	type: 'problem',
	docs: {
		description: 'Require jest.requireActual() when creating partial mocks.',
		guidelineRuleId: 'testing.spec.partial-mocks.use-jest-require-actual',
	},
	schema: [],
	messages: {
		useJestRequireActual:
			'Use jest.requireActual() inside partial mocks before overriding specific exports.',
	},
}

function isJestMockCall(node) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const callee = node.callee
	if (callee?.type !== 'MemberExpression' || callee.computed) {
		return false
	}

	return (
		callee.object?.type === 'Identifier' &&
		callee.object.name === 'jest' &&
		callee.property?.type === 'Identifier' &&
		callee.property.name === 'mock'
	)
}

function getFactory(node) {
	const [, secondArg] = node.arguments
	if (!secondArg) {
		return null
	}

	if (
		secondArg.type === 'FunctionExpression' ||
		secondArg.type === 'ArrowFunctionExpression'
	) {
		return secondArg
	}

	return null
}

function isJestRequireActualCall(node) {
	if (node?.type !== 'CallExpression') {
		return false
	}

	const callee = node.callee
	if (callee?.type !== 'MemberExpression' || callee.computed) {
		return false
	}

	return (
		callee.object?.type === 'Identifier' &&
		callee.object.name === 'jest' &&
		callee.property?.type === 'Identifier' &&
		callee.property.name === 'requireActual'
	)
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

function factoryHasRequireActual(factory) {
	const stack = [factory.body]
	const seen = new Set()

	while (stack.length > 0) {
		const current = stack.pop()
		if (!current || typeof current !== 'object') {
			continue
		}
		if (seen.has(current)) {
			continue
		}
		seen.add(current)

		if (isJestRequireActualCall(current)) {
			return true
		}

		if (
			(current.type === 'FunctionExpression' ||
				current.type === 'ArrowFunctionExpression') &&
			current !== factory
		) {
			continue
		}

		for (const value of Object.values(current)) {
			enqueueTraversalTargets(stack, value)
		}
	}

	return false
}

function factoryReturnsObjectLiteral(factory) {
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
		const arg = statement.argument
		if (arg?.type === 'ObjectExpression') {
			return arg.properties.length > 0
		}
	}

	return false
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				if (!isJestMockCall(node)) {
					return
				}

				const factory = getFactory(node)
				if (!factory) {
					return
				}

				if (!factoryReturnsObjectLiteral(factory)) {
					return
				}

				if (factoryHasRequireActual(factory)) {
					return
				}

				context.report({
					node: node.arguments[1] ?? node,
					messageId: 'useJestRequireActual',
				})
			},
		}
	},
}

export default rule
