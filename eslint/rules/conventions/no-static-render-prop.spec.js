import { ruleTester } from '../rule-tester.js'

import { noStaticRenderPropRule } from './no-static-render-prop.js'

ruleTester.run('no-static-render-prop', noStaticRenderPropRule, {
	valid: [
		'<List renderItem={({ item }) => <Item item={item} />} />',
		'<Suspense fallback={<Spinner />} />',
		'<Button icon={<PlusIcon />} />',
		`import { Route } from 'react-router'
const route = <Route element={<Login />} />`,
		{
			code: '<Card media={<Image />} />',
			options: [{ allowedProps: ['media'] }],
		},
	],
	invalid: [
		{
			code: '<Composer renderHeader={() => <Header />} />',
			errors: [{ messageId: 'noStaticRenderProp' }],
		},
		{
			code: '<Composer headerComponent={(_props) => <Header />} />',
			errors: [{ messageId: 'noStaticRenderProp' }],
		},
		{
			code: '<Composer header={<Header />} />',
			errors: [{ messageId: 'noStaticElementProp' }],
		},
		{
			code: `const headerElement = <Header />
const composer = <Composer header={headerElement} />`,
			errors: [{ messageId: 'noStaticElementProp' }],
		},
		{
			code: '<Composer header={CustomHeader} />',
			errors: [{ messageId: 'noStaticElementProp' }],
		},
	],
})
