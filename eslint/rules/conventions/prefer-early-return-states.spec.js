import { ruleTester } from '../rule-tester.js'

import { preferEarlyReturnStatesRule } from './prefer-early-return-states.js'

ruleTester.run('prefer-early-return-states', preferEarlyReturnStatesRule, {
	valid: [
		'function Tasks({ isPending, data }) { if (isPending) return <Layout><Skeleton /></Layout>; return <Layout>{data.assignee ? <UserInfo /> : null}</Layout> }',
		'function Tasks({ isOpen }) { return isOpen ? <Panel /> : <Closed /> }',
	],
	invalid: [
		{
			code: 'function Tasks({ isPending, data }) { return <Layout>{isPending ? <Skeleton /> : null}{data ? <List /> : null}{!data && !isPending ? <Empty /> : null}</Layout> }',
			errors: [{ messageId: 'sharedStateConditionals' }],
		},
		{
			code: 'function Tasks({ isPending, data }) { return <Layout>{isPending ? <Skeleton /> : !data ? <Empty /> : <List />}</Layout> }',
			errors: [{ messageId: 'chainedConditional' }],
		},
	],
})
