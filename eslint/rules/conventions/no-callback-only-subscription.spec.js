import { ruleTester } from '../rule-tester.js'
import { noCallbackOnlySubscriptionRule } from './no-callback-only-subscription.js'

ruleTester.run(
	'no-callback-only-subscription',
	noCallbackOnlySubscriptionRule,
	{
		valid: [
			"function Search() { const searchParams = useSearchParams(); return <p>{searchParams.get('q')}</p> }",
			"function Share() { function handleShare() { new URLSearchParams(window.location.search).get('ref') } return <button onClick={handleShare} /> }",
			{
				code: "function Share() { const searchParams = useSearchParams(); function handleShare() { searchParams.get('ref') } return <button onClick={handleShare} /> }",
				options: [{ hooks: ['usePathname'] }],
			},
		],
		invalid: [
			{
				code: "function Share() { const searchParams = useSearchParams(); function handleShare() { searchParams.get('ref') } return <button onClick={handleShare} /> }",
				errors: [{ messageId: 'noCallbackOnlySubscription' }],
			},
			{
				code: "function Share() { const searchParams = useSearchParams(); const handleShare = useCallback(() => searchParams.get('ref'), [searchParams]); return <button onClick={handleShare} /> }",
				errors: [{ messageId: 'noCallbackOnlySubscription' }],
			},
			{
				code: 'function Nav() { const pathname = usePathname(); function handleClick() { track(pathname) } return <a onClick={handleClick} /> }',
				options: [{ hooks: ['usePathname'] }],
				errors: [{ messageId: 'noCallbackOnlySubscription' }],
			},
		],
	},
)
