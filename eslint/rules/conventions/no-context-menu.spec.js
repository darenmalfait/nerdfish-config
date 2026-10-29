import { ruleTester } from '../rule-tester.js'
import { noContextMenuRule } from './no-context-menu.js'

ruleTester.run('no-context-menu', noContextMenuRule, {
	valid: [
		"<div onContextMenu={() => track('right-click')} />",
		"element.addEventListener('click', (event) => event.preventDefault())",
		"element.addEventListener('contextmenu', () => track('right-click'))",
	],
	invalid: [
		{
			code: '<div onContextMenu={(event) => event.preventDefault()} />',
			errors: [{ messageId: 'noContextMenu' }],
		},
		{
			code: 'function Canvas() { function handleContextMenu(event) { event.preventDefault() } return <div onContextMenu={handleContextMenu} /> }',
			errors: [{ messageId: 'noContextMenu' }],
		},
		{
			code: "element.addEventListener('contextmenu', (event) => event.preventDefault())",
			errors: [{ messageId: 'noContextMenu' }],
		},
	],
})
