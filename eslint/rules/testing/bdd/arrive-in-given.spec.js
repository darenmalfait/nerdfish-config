import { ruleTester } from '../../rule-tester.js'
import { bddArriveInGivenRule } from './arrive-in-given.js'

ruleTester.run('arrive-in-given', bddArriveInGivenRule, {
	valid: [
		`describe('Given a signed-in user', () => {
	beforeEach(() => {
		render(<Profile />)
	})
})`,
		`Given('a signed-in user', () => {
	beforeEach(() => render(<Profile />))
})`,
		'function renderProfile() { render(<Profile />) }',
		`it('works', () => {
	const { result } = renderHook(() => useProfile())
})`,
		{
			code: `describe('Given an error', () => {
	beforeEach(() => mswServer.use(errorHandler))
})`,
			options: [{ mockServerName: 'mswServer' }],
		},
	],
	invalid: [
		{
			code: `it('shows the name', () => {
	render(<Profile />)
})`,
			errors: [{ messageId: 'arriveInGiven' }],
		},
		{
			code: `describe('When the user saves', () => {
	beforeEach(() => page.goto('/profile'))
})`,
			errors: [{ messageId: 'arriveInGiven' }],
		},
		{
			code: `it('loads', () => {
	cy.visit('/profile')
})`,
			errors: [{ messageId: 'arriveInGiven' }],
		},
		{
			code: `it('fails', () => {
	server.use(errorHandler)
})`,
			errors: [{ messageId: 'arriveInGiven' }],
		},
		{
			code: `it('renders', () => {
	renderWithProviders(<Profile />)
})`,
			errors: [{ messageId: 'arriveInGiven' }],
		},
	],
})
