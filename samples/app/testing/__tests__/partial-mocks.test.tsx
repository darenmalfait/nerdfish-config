import { describe, expect, it, jest } from './testing-runtime'

jest.mock('./module', () => ({
	...jest.requireActual('./module'),
	onlyExport: 'mocked',
}))

describe('partial module mocks', () => {
	it('uses the mock', () => {
		expect(true).toBe(true)
	})
})
