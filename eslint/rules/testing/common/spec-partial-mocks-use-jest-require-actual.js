// Guideline registry id: testing.spec.partial-mocks.use-jest-require-actual
import {
	factoryUsesJestRequireActual,
	getFactoryReturnedObject,
	getSecondCallback,
	isJestMemberCall,
	resolveStaticStringValue,
} from './util.js'

/** Names a file imports from each module: `import a, { b } from './x'` → './x' → [default, b]. */
function collectImportedNames(program) {
	const importsBySource = new Map()

	for (const statement of program.body) {
		if (
			statement.type !== 'ImportDeclaration' ||
			statement.importKind === 'type'
		) {
			continue
		}

		const names = importsBySource.get(statement.source.value) ?? []

		for (const specifier of statement.specifiers) {
			if (specifier.type === 'ImportDefaultSpecifier') {
				names.push('default')
			} else if (
				specifier.type === 'ImportSpecifier' &&
				specifier.importKind !== 'type'
			) {
				names.push(specifier.imported.name ?? specifier.imported.value)
			}
		}

		importsBySource.set(statement.source.value, names)
	}

	return importsBySource
}

function toPropertyName(property) {
	if (property.type !== 'Property' || property.computed) {
		return null
	}

	return property.key.type === 'Identifier'
		? property.key.name
		: String(property.key.value)
}

export const specPartialMocksUseJestRequireActualRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require jest.requireActual() in mocks that leave out exports the test file imports.',
			guidelineRuleId: 'testing.spec.partial-mocks.use-jest-require-actual',
		},
		schema: [],
		messages: {
			missingExports:
				"This mock of '{{source}}' leaves out {{names}}, which this file imports, so they are undefined in the test. Spread jest.requireActual('{{source}}') into the factory to keep the real exports, or mock them too.",
		},
	},
	create(context) {
		let importsBySource = new Map()

		/**
		 * Checks:
		 * import { fetchUser } from './api'; jest.mock('./api', () => ({ fetchUser: jest.fn() })) ✅ covers every import
		 * jest.mock('./api', () => ({ ...jest.requireActual('./api'), fetchUser: jest.fn() })) ✅
		 * import { fetchUser, formatUser } from './api'; jest.mock('./api', () => ({ fetchUser: jest.fn() })) ❌ formatUser is undefined
		 */
		return {
			Program(node) {
				importsBySource = collectImportedNames(node)
			},
			CallExpression(node) {
				if (!isJestMemberCall(node, 'mock')) {
					return
				}

				const source = resolveStaticStringValue(node.arguments[0])
				const imported = importsBySource.get(source)
				const factory = getSecondCallback(node)
				const mocked = factory && getFactoryReturnedObject(factory)

				// A spread may carry any export, so only plain property lists are checked.
				if (
					!imported ||
					!mocked ||
					mocked.properties.some(({ type }) => type === 'SpreadElement') ||
					factoryUsesJestRequireActual(factory)
				) {
					return
				}

				const keys = new Set(mocked.properties.map(toPropertyName))
				// Without `__esModule`, a default import receives the whole mock object.
				const isDefaultCovered = !keys.has('__esModule') || keys.has('default')
				const missing = imported.filter((name) =>
					name === 'default' ? !isDefaultCovered : !keys.has(name),
				)

				if (missing.length === 0) {
					return
				}

				context.report({
					node: node.arguments[1],
					messageId: 'missingExports',
					data: {
						source,
						names: missing.map((name) => `\`${name}\``).join(', '),
					},
				})
			},
		}
	},
}
