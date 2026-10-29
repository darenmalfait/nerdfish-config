import { ruleTester } from '../../rule-tester.js'
import { bddUserStoryStructureRule } from './user-story-structure.js'

ruleTester.run('user-story-structure', bddUserStoryStructureRule, {
	valid: [
		`describe('User Story: user edits their profile', () => {
	describe('Given a signed-in user', () => {
		beforeEach(() => render(<Profile />))
		describe('When the user saves', () => {})
	})
})`,
		`describe('formatDate', () => {
	it('formats ISO dates', () => {})
})`,
	],
	invalid: [
		{
			code: `describe('Profile', () => {
	beforeEach(() => render(<Profile />))
})`,
			errors: [{ messageId: 'topLevelUserStory' }],
		},
		{
			code: `describe('User Story: user edits their profile', () => {
	describe('saving', () => {})
	beforeEach(() => render(<Profile />))
})`,
			errors: [{ messageId: 'nestedGivenWhen' }],
		},
		{
			code: `describe('User Story: user edits their profile', () => {
	describe('When the user saves', () => {
		describe('Given an error', () => {})
	})
	beforeEach(() => render(<Profile />))
})`,
			errors: [{ messageId: 'givenUnderUserStory' }],
		},
		{
			code: `describe('User Story: user formats dates', () => {
	it('formats ISO dates', () => {})
})`,
			errors: [{ messageId: 'bddInUnit' }],
		},
		{
			code: `describe('Profile', () => {
	beforeEach(() => mswServer.use(handler))
})`,
			options: [{ mockServerName: 'mswServer' }],
			errors: [{ messageId: 'topLevelUserStory' }],
		},
	],
})
