import { ruleTester } from '../../rule-tester.js'

import { specHttpMockLifecycleRule } from './spec-http-mock-lifecycle.js'

ruleTester.run('spec-http-mock-lifecycle', specHttpMockLifecycleRule, {
	valid: [
		"it('renders', () => {})",
		`const server = setupServer()
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())`,
		{
			code: `const mswServer = setupServer()
beforeAll(() => mswServer.listen())
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())`,
			options: [{ mockServerName: 'mswServer' }],
		},
	],
	invalid: [
		{
			code: 'const server = setupServer()',
			errors: [
				{ messageId: 'missingBeforeAll' },
				{ messageId: 'missingAfterEach' },
				{ messageId: 'missingAfterAll' },
			],
		},
		{
			code: `const server = setupServer()
beforeAll(() => server.listen())
afterAll(() => server.close())`,
			errors: [{ messageId: 'missingAfterEach' }],
		},
		{
			code: `it('mocks', () => {
	server.use(handler)
})`,
			errors: [
				{ messageId: 'missingBeforeAll' },
				{ messageId: 'missingAfterEach' },
				{ messageId: 'missingAfterAll' },
			],
		},
		{
			code: `const mswServer = setupServer()
beforeAll(() => mswServer.listen())`,
			options: [{ mockServerName: 'mswServer' }],
			errors: [
				{ messageId: 'missingAfterEach' },
				{ messageId: 'missingAfterAll' },
			],
		},
	],
})
