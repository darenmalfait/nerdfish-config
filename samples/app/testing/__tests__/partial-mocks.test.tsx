import { describe, expect, it, jest } from './testing-runtime'

jest.mock('./module', () => ({
	...jest.requireActual('./module'),
	onlyExport: 'mocked',
}))

describe('User Story: user can load a partially mocked module', () => {
	it('uses the mock', () => {
		expect(true).toBe(true)
	})
})
