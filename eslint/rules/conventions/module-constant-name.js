import { getRenameFixes, isShadowed } from '../util.js'

const SCREAMING_SNAKE_CASE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/

const STATIC_COLLECTIONS = new Set(['Map', 'Set'])

const MUTATING_METHODS = new Set([
	'add',
	'clear',
	'copyWithin',
	'delete',
	'fill',
	'pop',
	'push',
	'reverse',
	'set',
	'shift',
	'sort',
	'splice',
	'unshift',
])

const TS_WRAPPERS = new Set([
	'TSAsExpression',
	'TSSatisfiesExpression',
	'TSNonNullExpression',
	'TSTypeAssertion',
])

/** `noTags` → `NO_TAGS`, `i18nKeys` → `I18N_KEYS`, `parseHTMLNotes` → `PARSE_HTML_NOTES`. */
function toScreamingSnakeCase(name) {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
		.replace(/_+/g, '_')
		.replace(/^_|_$/g, '')
		.toUpperCase()
}

/**
 * Values fixed at module load: literals, plain arrays/objects of them and
 * `new Set()` / `new Map()` of them. Calls, identifiers, functions and JSX
 * are left alone — those are usually factories, API objects or components.
 */
function isStaticValue(node) {
	if (!node) {
		return false
	}

	if (TS_WRAPPERS.has(node.type)) {
		return isStaticValue(node.expression)
	}

	switch (node.type) {
		case 'Literal':
			return true
		case 'TemplateLiteral':
			return node.expressions.length === 0
		case 'UnaryExpression':
			return ['-', '+'].includes(node.operator) && isStaticValue(node.argument)
		case 'ArrayExpression':
			return node.elements.every(isStaticValue)
		case 'ObjectExpression':
			return node.properties.every(
				(property) =>
					property.type === 'Property' &&
					property.kind === 'init' &&
					!property.method &&
					(!property.computed || property.key.type === 'Literal') &&
					isStaticValue(property.value),
			)
		case 'NewExpression':
			return (
				node.callee.type === 'Identifier' &&
				STATIC_COLLECTIONS.has(node.callee.name) &&
				node.arguments.every(isStaticValue)
			)
		default:
			return false
	}
}

/** Names exported through `export { name }` or `export default name`. */
function getExportedNames(program) {
	const names = new Set()

	for (const statement of program.body) {
		if (statement.type === 'ExportNamedDeclaration' && !statement.source) {
			for (const specifier of statement.specifiers) {
				names.add(specifier.local.name)
			}
		}

		if (
			statement.type === 'ExportDefaultDeclaration' &&
			statement.declaration.type === 'Identifier'
		) {
			names.add(statement.declaration.name)
		}
	}

	return names
}

/** A cache or registry (`cache.set(…)`, `items.push(…)`, `config.x = …`) is state, not a constant. */
function isMutation(reference) {
	const { parent } = reference.identifier

	if (
		parent.type !== 'MemberExpression' ||
		parent.object !== reference.identifier
	) {
		return false
	}

	const { parent: grandparent } = parent

	switch (grandparent.type) {
		case 'AssignmentExpression':
			return grandparent.left === parent
		case 'UpdateExpression':
			return true
		case 'UnaryExpression':
			return grandparent.operator === 'delete'
		case 'CallExpression':
			return (
				grandparent.callee === parent &&
				!parent.computed &&
				MUTATING_METHODS.has(parent.property.name)
			)
		default:
			return false
	}
}

export const moduleConstantNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require SCREAMING_SNAKE_CASE for non-exported module-level constants with a static value.',
		},

		fixable: 'code',

		schema: [],

		messages: {
			moduleConstantName:
				"'{{name}}' is a module-level constant with a fixed value. Name it in SCREAMING_SNAKE_CASE (`{{expected}}`) so it reads as config, not local state.",
		},
	},

	create(context) {
		const { sourceCode } = context

		/**
		 * Checks:
		 * const EMPTY_ITEMS: Item[] = [] ✅
		 * export const metadata = { title: 'Home' } ✅ exported — public or framework name
		 * const buttonVariants = cva('…') ✅ call result
		 * const api = { get: () => … } ✅ contains functions
		 * const cache = new Map(); cache.set(…) ✅ mutated, so it is state
		 * const emptyItems: Item[] = [] ❌
		 * const storageKey = 'theme' ❌
		 * const bars = [{ className: 'top-0' }] as const ❌
		 */
		return {
			Program(program) {
				const exportedNames = getExportedNames(program)
				const moduleScope = sourceCode.getScope(program)

				for (const statement of program.body) {
					if (
						statement.type !== 'VariableDeclaration' ||
						statement.kind !== 'const' ||
						statement.declare
					) {
						continue
					}

					for (const declarator of statement.declarations) {
						const { id, init } = declarator

						if (
							id.type !== 'Identifier' ||
							SCREAMING_SNAKE_CASE.test(id.name) ||
							exportedNames.has(id.name) ||
							!isStaticValue(init)
						) {
							continue
						}

						const [variable] = sourceCode.getDeclaredVariables(declarator)

						if (variable.references.some(isMutation)) {
							continue
						}

						const expected = toScreamingSnakeCase(id.name)
						const isFixable =
							SCREAMING_SNAKE_CASE.test(expected) &&
							!moduleScope.set.has(expected) &&
							variable.references.every(
								(reference) => !isShadowed(reference, expected, moduleScope),
							)

						context.report({
							node: id,
							messageId: 'moduleConstantName',
							data: { name: id.name, expected },
							fix: isFixable
								? (fixer) => getRenameFixes(fixer, id, variable, expected)
								: null,
						})
					}
				}
			},
		}
	},
}
