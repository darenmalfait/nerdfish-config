import { ruleTester } from '../../rule-tester.js'
import { noTestingInternalsRule } from './no-testing-internals.js'

ruleTester.run('no-testing-internals', noTestingInternalsRule, {
	valid: [
		"expect(screen.getByRole('button')).toBeDisabled()",
		"expect(link).toHaveAttribute('href', '/home')",
		"expect(button.getAttribute('aria-pressed')).toBe('true')",
	],
	invalid: [
		{
			code: "expect(button).toHaveClass('active')",
			errors: [{ messageId: 'noTestingInternals' }],
		},
		{
			code: "expect(button).toHaveAttribute('class', 'active')",
			errors: [{ messageId: 'noTestingInternals' }],
		},
		{
			code: "expect(button.className).toContain('active')",
			errors: [{ messageId: 'noTestingInternals' }],
		},
		{
			code: "expect(button.classList.contains('active')).toBe(true)",
			errors: [{ messageId: 'noTestingInternals' }],
		},
		{
			code: 'expect(wrapper.state()).toEqual({ isOpen: true })',
			errors: [{ messageId: 'noTestingInternals' }],
		},
		{
			code: 'expect(component.props.isOpen).toBe(true)',
			errors: [{ messageId: 'noTestingInternals' }],
		},
		{
			code: "expect(button.getAttribute('style')).toBe('color: red')",
			errors: [{ messageId: 'noTestingInternals' }],
		},
	],
})
