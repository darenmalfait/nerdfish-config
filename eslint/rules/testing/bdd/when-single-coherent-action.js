// Guideline registry id: testing.bdd.when-single-coherent-action
import { getSecondCallback, resolveStaticStringArg } from '../../util.js'
import { callbackHasMultipleActions, isBddScopeBlock } from './util.js'

const AND_REGEX = /\band\b/i

export const bddWhenSingleCoherentActionRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require When blocks to represent a single coherent action (title or direct body). Multiple steps in beforeEach are allowed when they perform that one action.',
			guidelineRuleId: 'testing.bdd.when-single-coherent-action',
		},
		schema: [],
		messages: {
			whenSingleAction:
				'Each When block should represent a single coherent action.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (
					!isBddScopeBlock(node, {
						helperName: 'When',
						describeTitlePrefix: 'When ',
					})
				) {
					return
				}

				const title = resolveStaticStringArg(node)
				if (title?.value && AND_REGEX.test(title.value)) {
					context.report({
						node: title.node,
						messageId: 'whenSingleAction',
					})
					return
				}

				const callback = getSecondCallback(node)
				if (
					!callback ||
					!callbackHasMultipleActions(callback, { excludeTestHarness: true })
				) {
					return
				}

				context.report({
					node: title?.node ?? node,
					messageId: 'whenSingleAction',
				})
			},
		}
	},
}
