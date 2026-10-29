import { ruleTester } from '../rule-tester.js'
import { contextValueInterfaceRule } from './context-value-interface.js'

ruleTester.run('context-value-interface', contextValueInterfaceRule, {
	valid: [
		'<ComposerContext value={{ state, actions, meta }} />',
		'<ThemeContext value={theme} />',
		'<ComposerContext.Provider value={{ state, actions }} />',
	],
	invalid: [
		{
			code: '<ComposerContext value={{ input, setInput }} />',
			errors: [{ messageId: 'contextValueInterface' }],
		},
	],
})
