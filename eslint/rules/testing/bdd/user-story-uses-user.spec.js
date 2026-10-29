import { ruleTester } from '../../rule-tester.js'

import { bddUserStoryUsesUserRule } from './user-story-uses-user.js'

ruleTester.run('user-story-uses-user', bddUserStoryUsesUserRule, {
	valid: [
		"describe('User Story: user edits their profile', () => {})",
		"describe('User Story: as an admin I can revoke access', () => {})",
		"describe('Given a user', () => {})",
	],
	invalid: [
		{
			code: "describe('User Story: edit profile', () => {})",
			errors: [{ messageId: 'userStoryUsesUser' }],
		},
		{
			code: "describe('User Story: admin views the dashboard', () => {})",
			errors: [{ messageId: 'userStoryUsesUser' }],
		},
	],
})
