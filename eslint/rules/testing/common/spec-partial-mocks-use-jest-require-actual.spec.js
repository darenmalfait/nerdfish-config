import { ruleTester } from '../../rule-tester.js'
import { specPartialMocksUseJestRequireActualRule } from './spec-partial-mocks-use-jest-require-actual.js'

ruleTester.run(
	'spec-partial-mocks-use-jest-require-actual',
	specPartialMocksUseJestRequireActualRule,
	{
		valid: [
			"jest.mock('./api', () => ({ ...jest.requireActual('./api'), fetchUser: jest.fn() }))",
			"jest.mock('./api')",
			"jest.mock('./api', () => ({}))",
			`jest.mock('./api', () => {
	const actual = jest.requireActual('./api')
	return { ...actual, fetchUser: jest.fn() }
})`,
		],
		invalid: [
			{
				code: "jest.mock('./api', () => ({ fetchUser: jest.fn() }))",
				errors: [{ messageId: 'useJestRequireActual' }],
			},
			{
				code: `jest.mock('./api', () => {
	return { fetchUser: jest.fn() }
})`,
				errors: [{ messageId: 'useJestRequireActual' }],
			},
		],
	},
)
