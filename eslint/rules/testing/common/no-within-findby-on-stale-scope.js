// Guideline registry id: no-within-findby-on-stale-scope
import {
	FIND_QUERY_NAME_PATTERN,
	getMemberPropertyName,
	isWithinCall,
} from './util.js'

export const noWithinFindbyOnStaleScopeRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow within(...).findBy* on stale scopes; prefer waitFor with getBy.',
			guidelineRuleId: 'no-within-findby-on-stale-scope',
		},
		schema: [],
		messages: {
			noWithinFindBy:
				'Avoid within(...).findBy* on potentially stale scopes. Prefer waitFor(() => within(...).getBy*()).',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				const propertyName = getMemberPropertyName(node.callee)

				if (
					!propertyName ||
					!FIND_QUERY_NAME_PATTERN.test(propertyName) ||
					!isWithinCall(node.callee.object)
				) {
					return
				}

				context.report({
					node,
					messageId: 'noWithinFindBy',
				})
			},
		}
	},
}
