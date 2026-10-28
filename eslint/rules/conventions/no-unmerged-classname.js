import { getCallName, isFunctionNode } from '../util.js'

/** PascalCase, not SCREAMING_CASE: `Card`, not `MAX_ITEMS`. */
const COMPONENT_NAME = /^[A-Z][a-z]/

const COMPONENT_WRAPPERS = new Set(['forwardRef', 'memo'])

/** `function Card() {}`, `const Card = () => {}`, `const Card = memo(() => {})`. */
function getComponentName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name
	}

	let current = fn

	while (
		current.parent?.type === 'CallExpression' &&
		COMPONENT_WRAPPERS.has(getCallName(current.parent.callee))
	) {
		current = current.parent
	}

	return current.parent?.type === 'VariableDeclarator' &&
		current.parent.id.type === 'Identifier'
		? current.parent.id.name
		: null
}

function getEnclosingComponent(node) {
	for (let current = node.parent; current; current = current.parent) {
		if (isFunctionNode(current) || current.type === 'FunctionDeclaration') {
			return COMPONENT_NAME.test(getComponentName(current) ?? '')
				? current
				: null
		}
	}

	return null
}

function getDestructuredProperty(pattern, name) {
	return pattern.properties.find(
		(property) =>
			property.type === 'Property' &&
			!property.computed &&
			property.key.type === 'Identifier' &&
			property.key.name === name,
	)
}

function getRestName(pattern) {
	const rest = pattern.properties.find(
		(property) => property.type === 'RestElement',
	)

	return rest?.argument.type === 'Identifier' ? rest.argument.name : null
}

function spreads(attributes, name) {
	return attributes.some(
		(attribute) =>
			attribute.type === 'JSXSpreadAttribute' &&
			attribute.argument.type === 'Identifier' &&
			attribute.argument.name === name,
	)
}

export const noUnmergedClassnameRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Require components to merge the incoming `className` prop instead of overriding or dropping it.',
			url: 'https://github.com/WordPress/gutenberg/blob/trunk/packages/eslint-plugin/docs/rules/no-unmerged-classname.md',
		},

		schema: [],

		messages: {
			overridden:
				"This `className` overrides the one passed in through `{...{{spread}}}`. Destructure `className` and merge it: `className={cn('…', className)}`.",
			dropped:
				"`className` is pulled out of the props but never used, so callers cannot style this component. Merge it into the root element: `className={cn('…', className)}`.",
		},
	},

	create(context) {
		const { sourceCode } = context

		/**
		 * Checks:
		 * function Card({ className, ...props }) {
		 *   return <div {...props} className={cn('p-4', className)} />
		 * } ✅
		 * function Card(props) {
		 *   return <div {...props} className={cn('p-4', props.className)} />
		 * } ✅
		 * function Card(props) {
		 *   return <div {...props} className="p-4" />
		 * } ❌ (overrides the caller's className)
		 * function Card({ title, ...props }) {
		 *   return <div {...props} className="p-4" />
		 * } ❌
		 * function Card({ className, ...props }) {
		 *   return <div {...props} className="p-4" />
		 * } ❌ (className is dropped)
		 */
		function checkDroppedClassName(fn) {
			const [param] = fn.params

			if (
				param?.type !== 'ObjectPattern' ||
				!getRestName(param) ||
				!COMPONENT_NAME.test(getComponentName(fn) ?? '')
			) {
				return
			}

			const property = getDestructuredProperty(param, 'className')

			if (property?.value.type !== 'Identifier') {
				return
			}

			const variable = sourceCode
				.getDeclaredVariables(fn)
				.find((declared) => declared.name === property.value.name)

			if (variable?.references.length === 0) {
				context.report({ node: property, messageId: 'dropped' })
			}
		}

		return {
			FunctionDeclaration: checkDroppedClassName,
			FunctionExpression: checkDroppedClassName,
			ArrowFunctionExpression: checkDroppedClassName,

			JSXOpeningElement(node) {
				const classNameAttribute = node.attributes.find(
					(attribute) =>
						attribute.type === 'JSXAttribute' &&
						attribute.name.name === 'className',
				)

				if (!classNameAttribute) {
					return
				}

				const [param] = getEnclosingComponent(node)?.params ?? []

				if (param?.type === 'Identifier') {
					const isPropsClassNameMerged = sourceCode
						.getText(classNameAttribute)
						.includes(`${param.name}.className`)

					if (spreads(node.attributes, param.name) && !isPropsClassNameMerged) {
						context.report({
							node: classNameAttribute,
							messageId: 'overridden',
							data: { spread: param.name },
						})
					}

					return
				}

				if (param?.type !== 'ObjectPattern') {
					return
				}

				const restName = getRestName(param)

				if (
					restName &&
					spreads(node.attributes, restName) &&
					!getDestructuredProperty(param, 'className')
				) {
					context.report({
						node: classNameAttribute,
						messageId: 'overridden',
						data: { spread: restName },
					})
				}
			},
		}
	},
}
