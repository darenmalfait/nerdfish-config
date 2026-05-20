// Guideline registry id: bdd-user-story-structure
import { getStringTitleArgument, isDescribeCall } from '../common/util.js'

const meta = {
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
}

function getParentDescribe(node) {
	let current = node.parent

	while (current) {
		if (isDescribeCall(current)) {
			return current
		}

		current = current.parent
	}

	return null
}

const rule = {
	meta,
	create(context) {
		return {
			CallExpression(node) {
				if (!isDescribeCall(node)) {
					return
				}

				const title = getStringTitleArgument(node)
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

export default rule
