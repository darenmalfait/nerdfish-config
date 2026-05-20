// Guideline registry id: testing.bdd.user-story-uses-user
import { resolveStaticStringArg } from '../../util.js'
import { isDescribeCall } from './util.js'

const USER_STORY_PREFIX = 'User Story:'
const USER_WORD_REGEX = /\buser\b/i
const ROLE_STORY_HINT_REGEX =
	/\b(?:as an?\s+)?(?:admin|administrator|moderator|manager|supervisor|operator|owner|editor|auditor|support|agent)(?:\s+only|-only)?\b/i
const PERMISSION_USE_CASE_HINT_REGEX =
	/\b(permission|permissions|role|roles|access|authorization|authorisation|privilege|privileges|grant|revoke|approve|deny|delete|remove|manage)\b/i

function isPermissionSpecific(description) {
	return (
		ROLE_STORY_HINT_REGEX.test(description) &&
		PERMISSION_USE_CASE_HINT_REGEX.test(description)
	)
}

export const bddUserStoryUsesUserRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require user stories to mention "user" unless they are explicitly permission-specific.',
			guidelineRuleId: 'testing.bdd.user-story-uses-user',
		},
		schema: [],
		messages: {
			userStoryUsesUser:
				'User story descriptions should mention "user" unless the action is explicitly permission-specific.',
		},
	},
	create(context) {
		return {
			CallExpression(node) {
				if (!isDescribeCall(node)) {
					return
				}

				const title = resolveStaticStringArg(node)
				if (!title?.value.startsWith(USER_STORY_PREFIX)) {
					return
				}

				const description = title.value.slice(USER_STORY_PREFIX.length).trim()
				if (
					USER_WORD_REGEX.test(description) ||
					isPermissionSpecific(description)
				) {
					return
				}

				context.report({
					node: title.node,
					messageId: 'userStoryUsesUser',
				})
			},
		}
	},
}
