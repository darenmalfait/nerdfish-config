import { ruleTester } from '../rule-tester.js'
import { noAccumulatorSpreadRule } from './no-accumulator-spread.js'

ruleTester.run('no-accumulator-spread', noAccumulatorSpreadRule, {
	valid: [
		'Object.fromEntries(users.map((user) => [user.id, user]))',
		'users.reduce((byId, user) => { byId[user.id] = user; return byId }, {})',
		'users.reduce((total, user) => total + user.age, 0)',
		'users.reduce((merged, user) => ({ ...user }), {})',
	],
	invalid: [
		{
			code: 'users.reduce((byId, user) => ({ ...byId, [user.id]: user }), {})',
			errors: [{ messageId: 'noAccumulatorSpread' }],
		},
		{
			code: 'users.reduce((ids, user) => [...ids, user.id], [])',
			errors: [{ messageId: 'noAccumulatorSpread' }],
		},
		{
			code: 'users.reduce((ids, user) => ids.concat(user.id), [])',
			errors: [{ messageId: 'noAccumulatorSpread' }],
		},
		{
			code: 'users.reduce((byId, user) => { return { ...byId, [user.id]: user } }, {})',
			errors: [{ messageId: 'noAccumulatorSpread' }],
		},
	],
})
