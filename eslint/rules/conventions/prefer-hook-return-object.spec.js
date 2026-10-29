import { ruleTester } from '../rule-tester.js'

import { preferHookReturnObjectRule } from './prefer-hook-return-object.js'

ruleTester.run('prefer-hook-return-object', preferHookReturnObjectRule, {
	valid: [
		'function useToggle() { return [isOn, toggle] as const }',
		'function useForm() { return { values, errors, submit } }',
		'function getTriple() { return [a, b, c] }',
		'const useTuple = () => [a, b]',
	],
	invalid: [
		{
			code: 'function useForm() { return [values, errors, submit] }',
			errors: [{ messageId: 'preferObject' }],
		},
		{
			code: 'const useForm = () => [values, errors, submit] as const',
			errors: [{ messageId: 'preferObject' }],
		},
	],
})
