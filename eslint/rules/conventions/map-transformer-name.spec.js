import { ruleTester } from '../rule-tester.js'
import { mapTransformerNameRule } from './map-transformer-name.js'

ruleTester.run('map-transformer-name', mapTransformerNameRule, {
	valid: [
		'users.map(toName)',
		'users.flatMap(toTags)',
		'Array.from(nodes, toText)',
		'users.map((user) => user.name)',
		'users.map(function (user) { return user.name })',
		{ code: 'users.map(asName)', options: [{ prefix: 'as' }] },
	],
	invalid: [
		{ code: 'users.map(getName)', errors: [{ messageId: 'invalidName' }] },
		{ code: 'users.flatMap(tags)', errors: [{ messageId: 'invalidName' }] },
		{ code: 'Array.from(nodes, text)', errors: [{ messageId: 'invalidName' }] },
		{
			code: 'users.map(toName)',
			options: [{ prefix: 'as' }],
			errors: [{ messageId: 'invalidName' }],
		},
	],
})
