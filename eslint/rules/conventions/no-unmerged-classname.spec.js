import { ruleTester } from '../rule-tester.js'
import { noUnmergedClassnameRule } from './no-unmerged-classname.js'

ruleTester.run('no-unmerged-classname', noUnmergedClassnameRule, {
	valid: [
		"function Card({ className, ...props }) { return <div {...props} className={cn('p-4', className)} /> }",
		"function Card(props) { return <div {...props} className={cn('p-4', props.className)} /> }",
		'function Card({ title }) { return <div className="p-4">{title}</div> }',
		'function Card({ className, ...props }) { return <div className={className} {...props} /> }',
	],
	invalid: [
		{
			code: 'function Card(props) { return <div {...props} className="p-4" /> }',
			errors: [{ messageId: 'overridden' }],
		},
		{
			code: 'function Card({ title, ...props }) { return <div {...props} className="p-4" /> }',
			errors: [{ messageId: 'overridden' }],
		},
		{
			code: 'function Card({ className, ...props }) { return <div {...props} className="p-4" /> }',
			errors: [{ messageId: 'dropped' }],
		},
	],
})
