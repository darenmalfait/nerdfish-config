import { ruleTester } from '../rule-tester.js'

import { noDynamicImportPathRule } from './no-dynamic-import-path.js'

ruleTester.run('no-dynamic-import-path', noDynamicImportPathRule, {
	valid: [
		"import('./pages/home')",
		`const PAGE_MODULES = { home: () => import('./pages/home') }
PAGE_MODULES[name]()`,
		'import(`./pages/home`)',
	],
	invalid: [
		{
			code: 'import(PAGE_MODULES[name])',
			errors: [{ messageId: 'noDynamicImportPath' }],
		},
		{
			code: 'import(`./locales/${locale}.json`)',
			errors: [{ messageId: 'noDynamicImportPath' }],
		},
		{
			code: "import('./pages/' + name)",
			errors: [{ messageId: 'noDynamicImportPath' }],
		},
	],
})
