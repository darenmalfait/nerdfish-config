const NEGATION_WORDS = new Set([
	'cannot',
	'cant',
	'didnt',
	'doesnt',
	'dont',
	'hasnt',
	'isnt',
	'not',
	'shouldnt',
	'wont',
])

/** Domain terms that read as one concept, not a negation: an HTTP 404 is "not found". */
const DEFAULT_ALLOWED = ['notFound']

/** `isNotVisible` → `is not visible`, `CANNOT_EDIT` → `cannot edit`, `parseHTMLNotes` → `parse html notes`. */
function toWords(name) {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
		.toLowerCase()
		.split(/[\s_$]+/)
		.filter(Boolean)
}

export const noNegatedVariablesRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow negated variable and function names such as `isNotVisible` or `cannotEdit`.',
			url: 'https://github.com/Expensify/eslint-config-expensify/blob/main/eslint-plugin-expensify/no-negated-variables.js',
		},

		schema: [
			{
				type: 'object',
				properties: {
					allow: {
						type: 'array',
						items: { type: 'string' },
						uniqueItems: true,
						description: `camelCase terms that contain a negation but name one concept (default ${DEFAULT_ALLOWED.join(', ')}).`,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			negatedName:
				"'{{name}}' is negated, so checks against it read as double negatives (`!{{name}}`). Name the positive state instead (`isVisible` over `isNotVisible`, `canEdit` over `cannotEdit`) and negate at the call site.",
		},
	},

	create(context) {
		const allowed = (context.options[0]?.allow ?? DEFAULT_ALLOWED).map((term) =>
			toWords(term).join(' '),
		)

		function isNegated(name) {
			let phrase = ` ${toWords(name).join(' ')} `

			for (const term of allowed) {
				phrase = phrase.replaceAll(` ${term} `, ' ')
			}

			return phrase.split(' ').some((word) => NEGATION_WORDS.has(word))
		}

		function check(id) {
			if (id?.type === 'Identifier' && isNegated(id.name)) {
				context.report({
					node: id,
					messageId: 'negatedName',
					data: { name: id.name },
				})
			}
		}

		/**
		 * Checks:
		 * const isVisible = … ✅
		 * const notificationCount = … ✅ (`notification` is its own word)
		 * const isNotFound = … ✅ (allowed term)
		 * const isNotVisible = … ❌
		 * const CANNOT_EDIT = … ❌
		 * function dontShowAgain() {} ❌
		 */
		return {
			FunctionDeclaration(node) {
				check(node.id)
			},
			VariableDeclarator(node) {
				check(node.id)
			},
		}
	},
}
