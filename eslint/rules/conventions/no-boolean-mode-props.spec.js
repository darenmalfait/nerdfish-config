import { ruleTester } from '../rule-tester.js'
import { noBooleanModePropsRule } from './no-boolean-mode-props.js'

ruleTester.run('no-boolean-mode-props', noBooleanModePropsRule, {
	valid: [
		'function Dialog({ isOpen }) { return isOpen ? <Panel /> : null }',
		'function Field({ error }) { return error && <Error message={error} /> }',
		'function Composer({ isThread, isEditing }) { return <form data-thread={isThread} data-editing={isEditing} /> }',
		{
			code: 'function Composer({ isThread, isEditing }) { return <form>{isThread && <AlsoSend />}{isEditing ? <EditActions /> : <Actions />}</form> }',
			options: [{ max: 2 }],
		},
	],
	invalid: [
		{
			code: 'function Composer({ isThread, isEditing }) { return <form>{isThread && <AlsoSend />}{isEditing ? <EditActions /> : <Actions />}</form> }',
			errors: [{ messageId: 'noBooleanModeProps' }],
		},
	],
})
