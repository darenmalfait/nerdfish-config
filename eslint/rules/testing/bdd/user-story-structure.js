// Guideline registry id: bdd-user-story-structure
import { resolveStaticStringArg } from '../../util.js'
import { getParentDescribe, isDescribeCall } from './util.js'

export const bddUserStoryStructureRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require a basic User Story -> Given/When BDD describe structure in tests.',
			guidelineRuleId: 'bdd-user-story-structure',
		},
		schema: [],
		messages: {
			topLevelUserStory:
				'Top-level describe blocks should start with "User Story:" to follow the BDD test structure.',
			nestedGivenWhen:
				'Nested describe blocks should start with "Given " or "When " to follow the BDD test structure.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (!isDescribeCall(node)) {
					return
				}

				const title = resolveStaticStringArg(node)
				if (!title?.value) {
					return
				}

				const parentDescribe = getParentDescribe(node)

				if (!parentDescribe) {
					if (!title.value.startsWith('User Story:')) {
						context.report({
							node: title.node,
							messageId: 'topLevelUserStory',
						})
					}

					return
				}

				if (
					!title.value.startsWith('Given ') &&
					!title.value.startsWith('When ')
				) {
					context.report({
						node: title.node,
						messageId: 'nestedGivenWhen',
					})
				}
			},
		}
	},
}
