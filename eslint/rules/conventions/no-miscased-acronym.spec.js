import { ruleTester } from '../rule-tester.js'

import { noMiscasedAcronymRule } from './no-miscased-acronym.js'

ruleTester.run('no-miscased-acronym', noMiscasedAcronymRule, {
	valid: [
		'const apiUrl = 1; const userId = 2; const ApiClient = 3',
		'const API_URL = 1; const URL_MAX = 2; const MAX_ID = 3',
		'const url = new URL(href)',
		'const { userID } = payload',
		'fetch({ baseURL: base })',
		'declare global { interface Window { analyticsURL: string } }',
		'const IDENTITY = 1; const isHIDDEN = true',
		{ code: 'const x = 1', filename: 'src/api-client.ts' },
		{ code: 'const x = 1', filename: 'src/URL.ts' },
		{
			code: 'const jsonURL = 1',
			options: [{ acronyms: ['JSON'] }],
		},
	],
	invalid: [
		{
			code: 'const baseURL = 1; use(baseURL)',
			output: 'const baseUrl = 1; use(baseUrl)',
			errors: [
				{
					messageId: 'miscasedAcronym',
					data: { name: 'baseURL', expected: 'baseUrl' },
				},
			],
		},
		{
			code: 'const baseURL = 1; const options = { baseURL }',
			output: 'const baseUrl = 1; const options = { baseURL: baseUrl }',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'function getUserID() {} getUserID()',
			output: 'function getUserId() {} getUserId()',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'const fetchAPIData = 1',
			output: 'const fetchApiData = 1',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'const apiURLToSSOMap = 1',
			output: 'const apiUrlToSsoMap = 1',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'const getIDs = 1',
			output: 'const getIds = 1',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'type APIClientOptions = {}; let options: APIClientOptions',
			output: 'type ApiClientOptions = {}; let options: ApiClientOptions',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'interface SSOProvider {}',
			output: 'interface SsoProvider {}',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'enum OIDCMode {}',
			output: 'enum OidcMode {}',
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'export const baseURL = 1',
			output: null,
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'class Client { getURL() {} }',
			output: null,
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'const parseJSON = 1',
			output: 'const parseJson = 1',
			options: [{ acronyms: ['JSON'] }],
			errors: [{ messageId: 'miscasedAcronym' }],
		},
		{
			code: 'const x = 1',
			filename: 'src/useAPI.ts',
			errors: [
				{
					messageId: 'miscasedAcronymInFilename',
					data: { name: 'useAPI.ts', expected: 'useApi.ts' },
				},
			],
		},
	],
})
