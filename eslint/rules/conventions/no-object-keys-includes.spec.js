import { ruleTester } from '../rule-tester.js'
import { noObjectKeysIncludesRule } from './no-object-keys-includes.js'

ruleTester.run('no-object-keys-includes', noObjectKeysIncludesRule, {
	valid: [
		'Object.hasOwn(labels, status)',
		'Object.values(labels).includes(label)',
		'Object.keys(labels).length',
	],
	invalid: [
		{
			code: 'Object.keys(labels).includes(status)',
			output: 'Object.hasOwn(labels, status)',
			errors: [{ messageId: 'noObjectKeysIncludes' }],
		},
		{
			code: 'if (Object.keys(config.labels).includes(key)) {}',
			output: 'if (Object.hasOwn(config.labels, key)) {}',
			errors: [{ messageId: 'noObjectKeysIncludes' }],
		},
	],
})
