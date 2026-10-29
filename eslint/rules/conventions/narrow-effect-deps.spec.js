import { ruleTester } from '../rule-tester.js'
import { narrowEffectDepsRule } from './narrow-effect-deps.js'

ruleTester.run('narrow-effect-deps', narrowEffectDepsRule, {
	valid: [
		'function Profile({ user }) { useEffect(() => log(user.id), [user.id]) }',
		'function Profile({ user }) { useEffect(() => save(user), [user]) }',
		'function Profile({ user }) { useEffect(() => user.save(), [user]) }',
		'function Profile({ user }) { useEffect(() => log(user.id, user), [user]) }',
		'function Profile() { const ref = useRef(null); useEffect(() => log(ref.current), [ref]) }',
		'useEffect(() => log(user.id), [user])',
	],
	invalid: [
		{
			code: 'function Profile({ user }) { useEffect(() => log(user.id), [user]) }',
			errors: [
				{
					messageId: 'narrowDependency',
					suggestions: [
						{
							messageId: 'useProperties',
							output:
								'function Profile({ user }) { useEffect(() => log(user.id), [user.id]) }',
						},
					],
				},
			],
		},
		{
			code: 'function Profile({ user }) { const name = useMemo(() => format(user.name), [user]) }',
			errors: [
				{
					messageId: 'narrowDependency',
					suggestions: [
						{
							messageId: 'useProperties',
							output:
								'function Profile({ user }) { const name = useMemo(() => format(user.name), [user.name]) }',
						},
					],
				},
			],
		},
		{
			code: 'function Profile({ user }) { const handleClick = useCallback(() => log(user.id, user?.name), [user]) }',
			errors: [
				{
					messageId: 'narrowDependency',
					suggestions: [
						{
							messageId: 'useProperties',
							output:
								'function Profile({ user }) { const handleClick = useCallback(() => log(user.id, user?.name), [user.id, user?.name]) }',
						},
					],
				},
			],
		},
	],
})
