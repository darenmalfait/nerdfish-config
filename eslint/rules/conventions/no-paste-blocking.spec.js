import { ruleTester } from '../rule-tester.js'
import { noPasteBlockingRule } from './no-paste-blocking.js'

ruleTester.run('no-paste-blocking', noPasteBlockingRule, {
	valid: [
		'function Field() { function handlePaste(event) { track(event.clipboardData) } return <input onPaste={handlePaste} /> }',
		'<input onCopy={(event) => event.preventDefault()} />',
		"input.addEventListener('paste', (event) => track(event.clipboardData))",
		"input.addEventListener('copy', (event) => event.preventDefault())",
	],
	invalid: [
		{
			code: '<input onPaste={(event) => event.preventDefault()} />',
			errors: [{ messageId: 'noPasteBlocking' }],
		},
		{
			code: 'function Field() { function handlePaste(event) { event.preventDefault() } return <input onPaste={handlePaste} /> }',
			errors: [{ messageId: 'noPasteBlocking' }],
		},
		{
			code: '<input onPasteCapture={(event) => event.preventDefault()} />',
			errors: [{ messageId: 'noPasteBlocking' }],
		},
		{
			code: "input.addEventListener('paste', (event) => event.preventDefault())",
			errors: [{ messageId: 'noPasteBlocking' }],
		},
	],
})
