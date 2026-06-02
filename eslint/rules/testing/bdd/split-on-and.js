// Guideline registry id: testing.bdd.split-on-and
import { resolveStaticStringArg } from '../../util.js'
import { isNamedTestBlock } from './util.js'

const AND_REGEX = /\band\b/i

export const bddSplitOnAndRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Split test descriptions that combine multiple actions with "and".',
			guidelineRuleId: 'testing.bdd.split-on-and',
		},
		schema: [],
		messages: {
			splitOnAnd:
				'Split this test description; avoid combining actions with "and".',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (!isNamedTestBlock(node)) {
					return
				}

				const title = resolveStaticStringArg(node)
				if (!title?.value || !AND_REGEX.test(title.value)) {
					return
				}

				context.report({
					node: title.node,
					messageId: 'splitOnAnd',
				})
			},
		}
	},
}
