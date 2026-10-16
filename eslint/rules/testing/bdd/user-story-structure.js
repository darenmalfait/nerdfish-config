// Guideline registry id: bdd-user-story-structure
import {
	getMockServerName,
	mockServerNameSchema,
	resolveStaticStringArg,
} from '../../util.js'
import { getParentDescribe, isArriveCall, isDescribeCall } from './util.js'

const BDD_TITLE_REGEX = /^(User Story:|Given |When )/

export const bddUserStoryStructureRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require a User Story -> Given/When BDD describe structure in UI tests, and a flat structure in unit tests.',
			guidelineRuleId: 'bdd-user-story-structure',
		},
		schema: mockServerNameSchema,
		messages: {
			topLevelUserStory:
				'Top-level describe blocks should start with "User Story:" to follow the BDD test structure.',
			nestedGivenWhen:
				'Nested describe blocks should start with "Given " or "When " to follow the BDD test structure.',
			givenUnderUserStory:
				'Given blocks belong directly under the User Story; do not nest them under Given or When.',
			bddInUnit:
				'Unit tests (no render, goto, visit, or server.use) stay flat; drop the User Story / Given / When titles.',
		},
	},
	create(context) {
		// A file is a UI test if it arrives at a UI state anywhere, so describes are
		// collected and checked once the whole file has been seen.
		const mockServerName = getMockServerName(context)
		let isUiTest = false
		const describes = []

		return {
			CallExpression(node) {
				if (isArriveCall(node, mockServerName)) {
					isUiTest = true
				}

				if (isDescribeCall(node)) {
					describes.push(node)
				}
			},
			'Program:exit'() {
				for (const node of describes) {
					const title = resolveStaticStringArg(node)
					if (!title?.value) {
						continue
					}

					if (!isUiTest) {
						if (BDD_TITLE_REGEX.test(title.value)) {
							context.report({ node: title.node, messageId: 'bddInUnit' })
						}
						continue
					}

					const parentDescribe = getParentDescribe(node)

					if (!parentDescribe) {
						if (!title.value.startsWith('User Story:')) {
							context.report({
								node: title.node,
								messageId: 'topLevelUserStory',
							})
						}
						continue
					}

					if (title.value.startsWith('Given ')) {
						if (getParentDescribe(parentDescribe)) {
							context.report({
								node: title.node,
								messageId: 'givenUnderUserStory',
							})
						}
						continue
					}

					if (!title.value.startsWith('When ')) {
						context.report({
							node: title.node,
							messageId: 'nestedGivenWhen',
						})
					}
				}
			},
		}
	},
}
