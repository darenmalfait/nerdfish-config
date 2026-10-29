import { ruleTester } from '../rule-tester.js'
import { noNavigatePreferLinkRule } from './no-navigate-prefer-link.js'

ruleTester.run('no-navigate-prefer-link', noNavigatePreferLinkRule, {
	valid: [
		'<Link href="/settings">Settings</Link>',
		"<button onClick={() => { save(); navigate('/done') }} />",
		'<button onClick={() => navigate(-1)} />',
		"<button onClick={() => items.push('/x')} />",
		"<button onClick={() => app.router.push('/x')} />",
		"<button onMouseEnter={() => navigate('/x')} />",
		"function Toolbar() { const handleOpen = useCallback(() => navigate('/x'), []); return <button onClick={handleOpen} /> }",
		{
			code: "<button onClick={() => navigate('/x')} />",
			options: [{ functions: ['history.push'] }],
		},
	],
	invalid: [
		{
			code: "<button onClick={() => navigate('/settings')} />",
			errors: [{ messageId: 'preferLink', data: { name: 'navigate' } }],
		},
		{
			code: '<button onClick={() => { router.push(`/users/${id}`) }} />',
			errors: [{ messageId: 'preferLink', data: { name: 'router.push' } }],
		},
		{
			code: "function Toolbar() { function handleOpen() { navigate('/x') } return <button onClick={handleOpen} /> }",
			errors: [{ messageId: 'preferLink' }],
		},
		{
			code: "function Toolbar() { const handleOpen = () => router.push('/x'); return <button onClick={handleOpen} /> }",
			errors: [{ messageId: 'preferLink' }],
		},
		{
			code: "<button onClick={() => history.push('/x')} />",
			options: [{ functions: ['history.push'] }],
			errors: [{ messageId: 'preferLink', data: { name: 'history.push' } }],
		},
	],
})
