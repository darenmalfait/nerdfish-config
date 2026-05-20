// Guideline registry id: no-stored-element-queries
import {
	allowsStoredQueryBinding,
	isScreenOrWithinQuery,
	unwrapAwaitExpression,
} from './util.js'

export const noStoredElementQueriesRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow stale element references across test phases; prefer getter functions.',
			guidelineRuleId: 'no-stored-element-queries',
		},
		schema: [],
		messages: {
			noStoredElementQuery:
				'Avoid storing queried elements across test phases. Prefer getter functions so tests always use a fresh DOM query.',
		},
	},
	create(context) {
		function reportIfStoredQuery(node, expression) {
			const query = unwrapAwaitExpression(expression)
			if (!isScreenOrWithinQuery(query) || allowsStoredQueryBinding(node)) {
				return
			}

			context.report({
				node,
				messageId: 'noStoredElementQuery',
			})
		}

		return {
			VariableDeclarator(node) {
				if (node.id.type !== 'Identifier') {
					return
				}

				reportIfStoredQuery(node, node.init)
			},
			AssignmentExpression(node) {
				if (node.operator !== '=' || node.left?.type !== 'Identifier') {
					return
				}

				reportIfStoredQuery(node, node.right)
			},
		}
	},
}
