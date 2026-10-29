import { ruleTester } from '../rule-tester.js'

import { noCompoundComponentObjectRule } from './no-compound-component-object.js'

ruleTester.run('no-compound-component-object', noCompoundComponentObjectRule, {
	valid: [
		'export function ComposerHeader() {}',
		'const styles = { header: "p-4", footer: "p-2" }',
		'const config = Object.assign({}, defaults, { debug: true })',
	],
	invalid: [
		{
			code: 'const Composer = { Frame: ComposerFrame, Header: ComposerHeader }',
			errors: [{ messageId: 'noCompoundComponentObject' }],
		},
		{
			code: 'const Composer = Object.assign(ComposerRoot, { Header: ComposerHeader })',
			errors: [{ messageId: 'noCompoundComponentObject' }],
		},
		{
			code: `function Composer() {}
Composer.Header = ComposerHeader`,
			errors: [{ messageId: 'noCompoundComponentObject' }],
		},
	],
})
