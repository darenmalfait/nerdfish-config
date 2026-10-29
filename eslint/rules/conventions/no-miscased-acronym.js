import { canRename, getRenameFixes, isExported } from '../util.js'

/** Acronyms that are spelled PascalCase inside identifiers: `apiUrl`, `userId`, `SsoProvider`. */
const DEFAULT_ACRONYMS = ['API', 'ID', 'OIDC', 'SAML', 'SSO', 'URL']

/**
 * An acronym is miscased when it ends a word after a lowercase letter (`baseURL`) or runs into the
 * next word (`APIClient`). `API_URL` and a bare `URL` are left alone: no lowercase word touches them.
 */
function createPattern(acronyms) {
	const alternatives = acronyms
		.toSorted((a, b) => b.length - a.length)
		.join('|')

	return new RegExp(
		`(?<=[a-z0-9])(?:${alternatives})(?![A-Z])|(?:${alternatives})(?=[A-Z][a-z])`,
		'g',
	)
}

const toPascalCase = (acronym) =>
	`${acronym.charAt(0)}${acronym.slice(1).toLowerCase()}`

/** Declarations inside `declare global { … }` or `declare module '…'` describe code we don't own. */
function isAmbient(node) {
	for (let current = node; current; current = current.parent) {
		if (current.declare) {
			return true
		}
	}

	return false
}

export const noMiscasedAcronymRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require acronyms in declared names and file names to be PascalCase (`apiUrl`, not `apiURL`).',
			url: 'https://github.com/twentyhq/twenty/blob/main/packages/twenty-oxlint-rules/rules/no-miscased-acronym-in-identifier.ts',
		},

		fixable: 'code',

		schema: [
			{
				type: 'object',
				properties: {
					acronyms: {
						type: 'array',
						items: { type: 'string', pattern: '^[A-Z0-9]+$' },
						uniqueItems: true,
						description: `Uppercase acronyms to enforce (default ${DEFAULT_ACRONYMS.join(', ')}).`,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			miscasedAcronym:
				'Write `{{expected}}` instead of `{{name}}`. Acronyms are PascalCase in identifiers, so one concept has one spelling for search and autocomplete.',
			miscasedAcronymInFilename:
				'Rename `{{name}}` to `{{expected}}`. A file keeps the casing of the symbol it exports, so one concept has one spelling for search.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const pattern = createPattern(
			context.options[0]?.acronyms ?? DEFAULT_ACRONYMS,
		)

		const toExpected = (name) => name.replace(pattern, toPascalCase)

		function check(declaration, id) {
			if (id?.type !== 'Identifier' || isAmbient(declaration)) {
				return
			}

			const expected = toExpected(id.name)

			if (expected === id.name) {
				return
			}

			const variable = sourceCode
				.getDeclaredVariables(declaration)
				.find(({ name }) => name === id.name)
			const isFixable =
				variable &&
				!isExported(variable, declaration) &&
				canRename(variable, expected)

			context.report({
				node: id,
				messageId: 'miscasedAcronym',
				data: { name: id.name, expected },
				fix: isFixable
					? (fixer) => getRenameFixes(fixer, id, variable, expected)
					: null,
			})
		}

		const checkDeclaration = (node) => check(node, node.id)

		/**
		 * Checks:
		 * const apiUrl = … ✅
		 * const API_URL = … ✅ screaming case keeps its acronyms
		 * const { userID } = payload ✅ destructured — the name comes from the source
		 * fetch({ baseURL }) ✅ object keys mirror shapes we don't own
		 * const baseURL = … ❌ → baseUrl
		 * function getUserID() ❌ → getUserId
		 * type APIClientOptions = … ❌ → ApiClientOptions
		 * useAPI.ts ❌ → useApi.ts
		 */
		return {
			Program(node) {
				const name = context.filename.split(/[/\\]/).pop() ?? ''
				const expected = toExpected(name)

				if (expected !== name) {
					context.report({
						node,
						loc: { line: 1, column: 0 },
						messageId: 'miscasedAcronymInFilename',
						data: { name, expected },
					})
				}
			},

			ClassDeclaration: checkDeclaration,
			FunctionDeclaration: checkDeclaration,
			TSEnumDeclaration: checkDeclaration,
			TSInterfaceDeclaration: checkDeclaration,
			TSTypeAliasDeclaration: checkDeclaration,
			VariableDeclarator: checkDeclaration,

			MethodDefinition(node) {
				if (!node.computed) {
					check(node, node.key)
				}
			},
		}
	},
}
