import { ruleTester } from '../rule-tester.js'
import { noUnstableHookDefaultsRule } from './no-unstable-hook-defaults.js'

ruleTester.run('no-unstable-hook-defaults', noUnstableHookDefaultsRule, {
	valid: [
		`const EMPTY_ITEMS: Item[] = []
function useItems({ items = EMPTY_ITEMS }) {}`,
		`const EMPTY_ITEMS: Item[] = []
const { data = EMPTY_ITEMS } = useQuery()`,
		"function useItems({ limit = 10, label = 'Items' }) {}",
		'function getItems({ items = [] }) {}',
	],
	invalid: [
		{
			code: 'function useItems({ items = [] }) {}',
			errors: [{ messageId: 'unstableDefault' }],
		},
		{
			code: 'function useItems(onChange = () => {}) {}',
			errors: [{ messageId: 'unstableDefault' }],
		},
		{
			code: 'const { data = [] } = useQuery()',
			errors: [{ messageId: 'unstableDefault' }],
		},
		{
			code: 'const [value = {}] = useSomething()',
			errors: [{ messageId: 'unstableDefault' }],
		},
	],
})
