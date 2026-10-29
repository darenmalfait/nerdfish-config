import { ruleTester } from '../rule-tester.js'

import { noBrowserGlobalsInRenderRule } from './no-browser-globals-in-render.js'

ruleTester.run('no-browser-globals-in-render', noBrowserGlobalsInRenderRule, {
	valid: [
		'function Card() { useEffect(() => { setWidth(window.innerWidth) }, []) }',
		'function Card() { return <button onClick={() => window.print()} /> }',
		{
			code: "if (typeof window !== 'undefined') window.addEventListener('resize', onResize)",
			options: [{ moduleScope: true }],
		},
		{
			code: "const isMac = navigator.platform.startsWith('Mac')",
			options: [{ moduleScope: false }],
		},
		'function format(date) { return date.toLocaleString(navigator.language) }',
		'function Card({ ref }: { ref: Window }) { return null }',
	],
	invalid: [
		{
			code: 'function Card() { const width = window.innerWidth; return <div /> }',
			errors: [{ messageId: 'render' }],
		},
		{
			code: "function useTheme() { return localStorage.getItem('theme') }",
			errors: [{ messageId: 'render' }],
		},
		{
			code: "function Card() { const [theme] = useState(() => localStorage.getItem('theme')); return theme }",
			errors: [{ messageId: 'render' }],
		},
		{
			code: "const isMac = navigator.platform.startsWith('Mac')",
			options: [{ moduleScope: true }],
			errors: [{ messageId: 'moduleScope' }],
		},
	],
})
