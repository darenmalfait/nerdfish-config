import { ruleTester } from '../rule-tester.js'
import { effectComponentsRule } from './effect-components.js'

ruleTester.run('effect-components', effectComponentsRule, {
	valid: [
		'function TitleSyncEffect() { useEffect(() => {}); return null }',
		'function Profile({ user }) { useUser(); if (!user) return null; return <Card /> }',
		'function Provider({ children }) { useTheme(); return children }',
		'const Placeholder = () => null',
		'function Item() { const render = () => null; useItem(); return <div onClick={render} /> }',
		'function useTitleSync() { useEffect(() => {}); return null }',
		'function Effect() { return <div /> }',
	],
	invalid: [
		{
			code: 'function TitleSync() { useEffect(() => {}); return null }\nconst app = <TitleSync />',
			output:
				'function TitleSyncEffect() { useEffect(() => {}); return null }\nconst app = <TitleSyncEffect />',
			errors: [
				{
					messageId: 'addSuffix',
					data: { name: 'TitleSync', expected: 'TitleSyncEffect' },
				},
			],
		},
		{
			code: 'const Sync = () => { React.useEffect(() => {}) }',
			output: 'const SyncEffect = () => { React.useEffect(() => {}) }',
			errors: [{ messageId: 'addSuffix' }],
		},
		{
			code: 'function Sync() { useEffect(() => {}); return <></> }',
			output: 'function SyncEffect() { useEffect(() => {}); return <></> }',
			errors: [{ messageId: 'addSuffix' }],
		},
		{
			code: 'function Sync() { useEffect(() => {}); return <React.Fragment> </React.Fragment> }',
			output:
				'function SyncEffect() { useEffect(() => {}); return <React.Fragment> </React.Fragment> }',
			errors: [{ messageId: 'addSuffix' }],
		},
		{
			code: 'function BannerEffect() { return <div /> }\nconst app = <BannerEffect />',
			output: 'function Banner() { return <div /> }\nconst app = <Banner />',
			errors: [
				{
					messageId: 'removeSuffix',
					data: { name: 'BannerEffect', expected: 'Banner' },
				},
			],
		},
		{
			code: 'export function Sync() { useEffect(() => {}); return null }',
			output: null,
			errors: [{ messageId: 'addSuffix' }],
		},
		{
			code: 'export default function Sync() { useEffect(() => {}); return null }',
			output: null,
			errors: [{ messageId: 'addSuffix' }],
		},
		{
			code: 'function Banner() {}\nfunction BannerEffect() { return <div /> }',
			output: null,
			errors: [{ messageId: 'removeSuffix' }],
		},
	],
})
