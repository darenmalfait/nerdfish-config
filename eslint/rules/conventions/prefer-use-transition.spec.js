import { ruleTester } from '../rule-tester.js'
import { preferUseTransitionRule } from './prefer-use-transition.js'

ruleTester.run('prefer-use-transition', preferUseTransitionRule, {
	valid: [
		'function Save() { const [isPending, startTransition] = useTransition(); async function handleSave() { startTransition(async () => { await save() }) } }',
		'function Dialog() { const [isOpen, setIsOpen] = useState(false); function handleClose() { setIsOpen(true); setIsOpen(false) } }',
	],
	invalid: [
		{
			code: 'function Save() { const [isLoading, setIsLoading] = useState(false); async function handleSave() { setIsLoading(true); await save(); setIsLoading(false) } }',
			errors: [{ messageId: 'preferUseTransition' }],
		},
		{
			code: 'function Save() { const [isLoading, setIsLoading] = useState(false); async function handleSave() { setIsLoading(true); try { await save() } finally { setIsLoading(false) } } }',
			errors: [{ messageId: 'preferUseTransition' }],
		},
	],
})
