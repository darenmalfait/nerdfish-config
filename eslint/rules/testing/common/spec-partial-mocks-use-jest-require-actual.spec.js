import { ruleTester } from '../../rule-tester.js'
import { specPartialMocksUseJestRequireActualRule } from './spec-partial-mocks-use-jest-require-actual.js'

ruleTester.run(
	'spec-partial-mocks-use-jest-require-actual',
	specPartialMocksUseJestRequireActualRule,
	{
		valid: [
			`import { fetchUser } from './api'
jest.mock('./api', () => ({ fetchUser: jest.fn() }))`,
			`import { fetchUser, formatUser } from './api'
jest.mock('./api', () => ({ ...jest.requireActual('./api'), fetchUser: jest.fn() }))`,
			`import { fetchUser, formatUser } from './api'
jest.mock('./api', () => {
	const actual = jest.requireActual('./api')
	return { ...actual, fetchUser: jest.fn() }
})`,
			`import { fetchUser, formatUser } from './api'
jest.mock('./api', () => ({ ...mockApi, fetchUser: jest.fn() }))`,
			`import api from './api'
jest.mock('./api', () => ({ fetchUser: jest.fn() }))`,
			`import { fetchUser } from './api'
import type { User } from './api'
jest.mock('./api', () => ({ fetchUser: jest.fn() }))`,
			`import { render } from '@testing-library/react'
jest.mock('./api', () => ({ fetchUser: jest.fn() }))`,
			`import { fetchUser } from './api'
jest.mock('./api')`,
		],
		invalid: [
			{
				code: `import { fetchUser, formatUser } from './api'
jest.mock('./api', () => ({ fetchUser: jest.fn() }))`,
				errors: [{ messageId: 'missingExports' }],
			},
			{
				code: `import { fetchUser, formatUser } from './api'
jest.mock('./api', () => {
	return { fetchUser: jest.fn() }
})`,
				errors: [{ messageId: 'missingExports' }],
			},
			{
				code: `import api, { fetchUser } from './api'
jest.mock('./api', () => ({ __esModule: true, fetchUser: jest.fn() }))`,
				errors: [{ messageId: 'missingExports' }],
			},
		],
	},
)
