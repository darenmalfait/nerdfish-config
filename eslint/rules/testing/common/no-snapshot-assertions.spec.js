import { ruleTester } from '../../rule-tester.js'
import { noSnapshotAssertionsRule } from './no-snapshot-assertions.js'

ruleTester.run('no-snapshot-assertions', noSnapshotAssertionsRule, {
	valid: [
		"expect(screen.getByRole('alert')).toHaveTextContent('Saved')",
		'expect(await page.screenshot()).toMatchSnapshot()',
	],
	invalid: [
		{
			code: 'expect(container).toMatchSnapshot()',
			errors: [{ messageId: 'noSnapshot' }],
		},
		{
			code: 'expect(render(<Card />)).toMatchInlineSnapshot(`<div />`)',
			errors: [{ messageId: 'noSnapshot' }],
		},
		{
			code: 'expect(container).not.toMatchSnapshot()',
			errors: [{ messageId: 'noSnapshot' }],
		},
		{
			code: 'expect(() => parse()).toThrowErrorMatchingSnapshot()',
			errors: [{ messageId: 'noSnapshot' }],
		},
	],
})
