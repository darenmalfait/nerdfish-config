// Guideline registry id: testing.bdd.when-requires-before-each
import { getSecondCallback, resolveStaticStringArg } from '../../util.js'
import { isBddScopeBlock, scopeBlockHasBeforeEach } from './util.js'

export const bddWhenRequiresBeforeEachRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require When blocks to run user actions in a beforeEach hook.',
			guidelineRuleId: 'testing.bdd.when-requires-before-each',
		},
		schema: [],
		messages: {
			whenRequiresBeforeEach:
				'Each When block should define user actions in a beforeEach hook.',
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

				const callback = getSecondCallback(node)
				if (callback && scopeBlockHasBeforeEach(callback)) {
					return
				}

				const title = resolveStaticStringArg(node)
				context.report({
					node: title?.node ?? node,
					messageId: 'whenRequiresBeforeEach',
				})
			},
		}
	},
}
