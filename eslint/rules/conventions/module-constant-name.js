import { canRename, getRenameFixes, isShadowed } from '../util.js'

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

/** Words a camelCased name could collide with: `DEFAULT` → `default`. */
const RESERVED_WORDS = new Set([
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'import',
	'in',
	'instanceof',
	'let',
	'new',
	'null',
	'return',
	'static',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'yield',
])

/** `MAX_ITEMS` → `maxItems`, `I18N_KEYS` → `i18nKeys`. */
function toCamelCase(name) {
	return name
		.toLowerCase()
		.replaceAll(/_([a-z0-9])/g, (_, char) => char.toUpperCase())
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
				'Require SCREAMING_SNAKE_CASE for non-exported module-level constants with a static value, and reserve it for module-level `const`s.',
		},

		fixable: 'code',

		schema: [],

		messages: {
			moduleConstantName:
				"'{{name}}' is a module-level constant with a fixed value. Name it in SCREAMING_SNAKE_CASE (`{{expected}}`) so it reads as config, not local state.",
			hoistConstant:
				"'{{name}}' has a fixed value but is recreated on every call. Move it to module scope.",
			computedConstant:
				"'{{name}}' is computed here, so it is not a constant. Name it in camelCase (`{{expected}}`); SCREAMING_SNAKE_CASE is for module-level constants.",
			reassignableConstant:
				"'{{name}}' is declared with `{{kind}}`, so it is state, not a constant. Make it a module-level `const`, or name it in camelCase (`{{expected}}`).",
		},
	},

	create(context) {
		const { sourceCode } = context

		/** `SCREAMING_CASE` outside a module-level `const`: hoist it, or rename it to camelCase. */
		function checkScreamingName(declarator) {
			const { id, init, parent: declaration } = declarator

			if (
				id.type !== 'Identifier' ||
				id.name.length < 2 ||
				!SCREAMING_SNAKE_CASE.test(id.name) ||
				declaration.declare
			) {
				return
			}

			const [variable] = sourceCode.getDeclaredVariables(declarator)
			const isModuleLevel = ['global', 'module'].includes(variable.scope.type)
			const isConst = declaration.kind === 'const'

			if (isConst && isModuleLevel) {
				return
			}

			const expected = toCamelCase(id.name)
			const isReassigned = variable.references.some(
				(reference) => reference.isWrite() && reference.identifier !== id,
			)
			const isExported =
				declaration.parent.type === 'ExportNamedDeclaration' ||
				variable.references.some(
					(reference) => reference.identifier.parent.type === 'ExportSpecifier',
				)

			let messageId = 'computedConstant'

			if (!isConst) {
				messageId = 'reassignableConstant'
			} else if (isStaticValue(init)) {
				messageId = 'hoistConstant'
			}

			// Renaming fits computed values and real state; a fixed value belongs at module scope instead.
			const isFixable =
				(messageId === 'computedConstant' || isReassigned) &&
				!isExported &&
				!RESERVED_WORDS.has(expected) &&
				canRename(variable, expected)

			context.report({
				node: id,
				messageId,
				data: { name: id.name, expected, kind: declaration.kind },
				fix: isFixable
					? (fixer) => getRenameFixes(fixer, id, variable, expected)
					: null,
			})
		}

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
		 * const { API_URL } = process.env ✅ destructured — the name comes from the source
		 * function List() { const MAX_ITEMS = 10 } ❌ fixed value → move to module scope
		 * function List({ items }) { const PAGE_SIZE = items.length > 50 ? 20 : 10 } ❌ → pageSize
		 * let RETRY_COUNT = 0 ❌ reassignable → retryCount, or a module-level const
		 */
		return {
			VariableDeclarator: checkScreamingName,
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
