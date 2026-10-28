const DEFAULT_MAXIMUM_STATEMENTS = 1

function getStatementCount(consequent) {
	return consequent.type === 'BlockStatement' ? consequent.body.length : 1
}

export const preferEarlyReturnRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Prefer a guard clause over wrapping the end of a function in an `if` without `else`.',
			url: 'https://github.com/Shopify/web-configs/blob/main/packages/eslint-plugin/docs/rules/prefer-early-return.md',
		},

		schema: [
			{
				type: 'object',
				properties: {
					maximumStatements: {
						type: 'integer',
						minimum: 0,
						description: `Statements allowed in the trailing \`if\` before it must become a guard clause (default ${DEFAULT_MAXIMUM_STATEMENTS}).`,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			preferEarlyReturn:
				'Invert this condition and return early instead of nesting the rest of the function inside it.',
		},
	},

	create(context) {
		const maximumStatements =
			context.options[0]?.maximumStatements ?? DEFAULT_MAXIMUM_STATEMENTS

		/**
		 * Checks:
		 * function save(form) {
		 *   if (!form.isValid) return
		 *   validate(form)
		 *   submit(form)
		 * } ✅
		 * function close() {
		 *   if (isOpen) setOpen(false)
		 * } ✅ (a single statement reads fine either way)
		 * function save(form) {
		 *   if (form.isValid) {
		 *     validate(form)
		 *     submit(form)
		 *   }
		 * } ❌
		 */
		function check(fn) {
			if (fn.body.type !== 'BlockStatement') {
				return
			}

			const last = fn.body.body.at(-1)

			if (
				last?.type !== 'IfStatement' ||
				last.alternate ||
				getStatementCount(last.consequent) <= maximumStatements
			) {
				return
			}

			context.report({
				node: last.test,
				messageId: 'preferEarlyReturn',
			})
		}

		return {
			FunctionDeclaration: check,
			FunctionExpression: check,
			ArrowFunctionExpression: check,
		}
	},
}
