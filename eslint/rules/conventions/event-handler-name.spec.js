import { ruleTester } from '../rule-tester.js'
import { eventHandlerNameRule } from './event-handler-name.js'

ruleTester.run('event-handler-name', eventHandlerNameRule, {
	valid: [
		'function Form() { function handleClick() {} return <button onClick={handleClick} /> }',
		'function Button({ onClick }) { return <button onClick={onClick} /> }',
		'function Form() { return <button onClick={() => submit()} /> }',
		'function Form() { const handleSave = useCallback(() => {}, []); return <button onClick={handleSave} /> }',
	],
	invalid: [
		{
			code: 'function Form() { function submitForm() {} return <form onSubmit={submitForm} /> }',
			output:
				'function Form() { function handleSubmitForm() {} return <form onSubmit={handleSubmitForm} /> }',
			errors: [{ messageId: 'eventHandlerPrefix' }],
		},
		{
			code: 'function Form() { const save = () => {}; return <button onClick={save} /> }',
			output:
				'function Form() { const handleSave = () => {}; return <button onClick={handleSave} /> }',
			errors: [{ messageId: 'eventHandlerPrefix' }],
		},
	],
})
