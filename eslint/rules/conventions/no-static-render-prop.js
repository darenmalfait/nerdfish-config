import {
	getJsxElementName,
	isFunctionNode,
	isJsxExpression,
	toCompoundPartName,
} from '../util.js'

/** Props where passing an element is the established API (e.g. `<Suspense fallback>`, polymorphic `as`, Base UI `render`). */
const DEFAULT_ALLOWED_PROPS = [
	'as',
	'children',
	'fallback',
	'icon',
	'render',
	'startIcon',
	'endIcon',
]

/** PascalCase, not SCREAMING_CASE: `CustomHeader`, not `MAX_ITEMS`. */
const COMPONENT_NAME = /^[A-Z][a-z]/

function returnsJsx(fn) {
	if (fn.body.type !== 'BlockStatement') {
		return isJsxExpression(fn.body)
	}

	return fn.body.body.some(
		(statement) =>
			statement.type === 'ReturnStatement' &&
			isJsxExpression(statement.argument),
	)
}

function findVariable(scope, name) {
	for (let current = scope; current; current = current.upper) {
		const variable = current.set.get(name)

		if (variable) {
			return variable
		}
	}

	return null
}

/** `const header = <Header />` / `function renderHeader() {}` → the JSX or function behind the identifier. */
function resolveIdentifier(sourceCode, identifier) {
	const definition = findVariable(
		sourceCode.getScope(identifier),
		identifier.name,
	)?.defs[0]

	if (definition?.node.type === 'FunctionDeclaration') {
		return definition.node
	}

	if (
		definition?.node.type === 'VariableDeclarator' &&
		definition.parent?.kind === 'const'
	) {
		return definition.node.init
	}

	return null
}

/** `() => <Header />` and `(_props) => <Header />` both ignore what the component passes in. */
function ignoresArguments(sourceCode, fn) {
	return sourceCode
		.getDeclaredVariables(fn)
		.filter((variable) => variable.defs[0]?.type === 'Parameter')
		.every((variable) => variable.references.length === 0)
}

export const noStaticRenderPropRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow passing static structure through props (JSX elements, components, or callbacks that ignore their arguments); compose with children instead.',
			guidelineRuleId: 'patterns-children-over-render-props',
		},

		schema: [
			{
				type: 'object',
				properties: {
					allowedProps: {
						type: 'array',
						items: {
							type: 'string',
						},
						uniqueItems: true,
						description: `Extra props that may receive JSX, on top of: ${DEFAULT_ALLOWED_PROPS.join(', ')}.`,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			noStaticRenderProp:
				'`{{attributeName}}` ignores what `<{{elementName}}>` passes in, so it is static structure, not a render prop. Make `{{rootName}}` a compound component instead and render the part as a child: `<{{rootName}}><{{rootName}}{{partName}}>…</{{rootName}}{{partName}}></{{rootName}}>`, with shared state read from context via `use()`. Export `{{rootName}}{{partName}}` as its own component, not as `{{rootName}}.{{partName}}`, so it works across the server/client boundary. Renaming the prop does not fix this. Render props are only for passing data back, like `renderItem={({ item }) => …}`. See vercel-composition-patterns: patterns-children-over-render-props, architecture-compound-components.',
			noStaticElementProp:
				'`{{attributeName}}` passes static structure into `<{{elementName}}>` through a prop. Make `{{rootName}}` a compound component instead and render the part as a child: `<{{rootName}}><{{rootName}}{{partName}}>…</{{rootName}}{{partName}}></{{rootName}}>`, with shared state read from context via `use()`. Export `{{rootName}}{{partName}}` as its own component, not as `{{rootName}}.{{partName}}`, so it works across the server/client boundary. Renaming the prop, hoisting the JSX into a variable, or passing the component itself does not fix this. See vercel-composition-patterns: patterns-children-over-render-props, architecture-compound-components.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const options = context.options[0] || {}

		const allowedProps = new Set([
			...DEFAULT_ALLOWED_PROPS,
			...(options.allowedProps || []),
		])

		function getViolation(value) {
			if (isJsxExpression(value)) {
				return 'noStaticElementProp'
			}

			if (value?.type !== 'JSXExpressionContainer') {
				return null
			}

			let { expression } = value

			if (expression.type === 'Identifier') {
				if (COMPONENT_NAME.test(expression.name)) {
					return 'noStaticElementProp'
				}

				expression = resolveIdentifier(sourceCode, expression)
			}

			if (isJsxExpression(expression)) {
				return 'noStaticElementProp'
			}

			if (
				isFunctionNode(expression) ||
				expression?.type === 'FunctionDeclaration'
			) {
				return returnsJsx(expression) &&
					ignoresArguments(sourceCode, expression)
					? 'noStaticRenderProp'
					: null
			}

			return null
		}

		/**
		 * Checks:
		 * <List renderItem={({ item }) => <Item item={item} />} /> ✅ (passes data back)
		 * <Suspense fallback={<Spinner />} /> ✅ (allowed prop)
		 * <Composer renderHeader={() => <Header />} /> ❌ (static structure)
		 * <Composer headerComponent={(_props) => <Header />} /> ❌ (renamed, argument ignored)
		 * <Composer header={<Header />} /> ❌ (same thing, without the callback)
		 * <Composer header={headerElement} /> ❌ (JSX hoisted into a const)
		 * <Composer header={CustomHeader} /> ❌ (component passed instead of rendered)
		 */
		return {
			JSXAttribute(node) {
				if (node.name?.type !== 'JSXIdentifier') {
					return
				}

				const attributeName = node.name.name

				if (allowedProps.has(attributeName)) {
					return
				}

				const messageId = getViolation(node.value)
				const elementName = getJsxElementName(node.parent.name) ?? 'Parent'

				if (!messageId) {
					return
				}

				context.report({
					node,
					messageId,
					data: {
						attributeName,
						elementName,
						rootName: elementName.split('.')[0],
						partName: toCompoundPartName(attributeName),
					},
				})
			},
		}
	},
}
