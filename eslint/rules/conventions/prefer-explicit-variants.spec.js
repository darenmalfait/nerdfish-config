import { ruleTester } from '../rule-tester.js'
import { preferExplicitVariantsRule } from './prefer-explicit-variants.js'

ruleTester.run('prefer-explicit-variants', preferExplicitVariantsRule, {
	valid: [
		'<ThreadComposer channelId="abc" />',
		'<Input required disabled />',
		`import { Dialog } from '@base-ui/react'
const dialog = <Dialog modal open keepMounted />`,
		{
			code: '<Composer isThread isEditing={false} showAttachments />',
			options: [{ max: 3 }],
		},
	],
	invalid: [
		{
			code: '<Composer isThread isEditing={false} showAttachments />',
			errors: [{ messageId: 'preferExplicitVariants' }],
		},
	],
})
