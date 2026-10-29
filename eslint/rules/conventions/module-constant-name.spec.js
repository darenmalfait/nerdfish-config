import { ruleTester } from '../rule-tester.js'

import { moduleConstantNameRule } from './module-constant-name.js'

ruleTester.run('module-constant-name', moduleConstantNameRule, {
	valid: [
		'const EMPTY_ITEMS: Item[] = []',
		"export const metadata = { title: 'Home' }",
		"const buttonVariants = cva('p-4')",
		'const api = { get: () => fetch(url) }',
		`const cache = new Map()
cache.set('a', 1)`,
		'const { API_URL } = process.env',
		"const STORAGE_KEY = 'theme'",
		'function List({ items }) { const pageSize = items.length > 50 ? 20 : 10 }',
	],
	invalid: [
		{
			code: 'const emptyItems: Item[] = []',
			output: 'const EMPTY_ITEMS: Item[] = []',
			errors: [{ messageId: 'moduleConstantName' }],
		},
		{
			code: `const storageKey = 'theme'
localStorage.getItem(storageKey)`,
			output: `const STORAGE_KEY = 'theme'
localStorage.getItem(STORAGE_KEY)`,
			errors: [{ messageId: 'moduleConstantName' }],
		},
		{
			code: "const bars = [{ className: 'top-0' }] as const",
			output: "const BARS = [{ className: 'top-0' }] as const",
			errors: [{ messageId: 'moduleConstantName' }],
		},
		{
			code: 'function List() { const MAX_ITEMS = 10 }',
			output: null,
			errors: [{ messageId: 'hoistConstant' }],
		},
		{
			code: 'function List({ items }) { const PAGE_SIZE = items.length > 50 ? 20 : 10; return PAGE_SIZE }',
			output:
				'function List({ items }) { const pageSize = items.length > 50 ? 20 : 10; return pageSize }',
			errors: [{ messageId: 'computedConstant' }],
		},
		{
			code: `let RETRY_COUNT = 0
RETRY_COUNT++`,
			output: `let retryCount = 0
retryCount++`,
			errors: [{ messageId: 'reassignableConstant' }],
		},
	],
})
