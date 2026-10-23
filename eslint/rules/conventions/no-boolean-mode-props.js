import { isJsxExpression, toCompoundPartName } from '../util.js'

const COMPONENT_NAME = /^[A-Z][a-z]/

function getComponentName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name
	}

	return fn.parent?.type === 'VariableDeclarator' ? fn.parent.id.name : null
}

function returnsJsxStatement(statement) {
	if (statement.type === 'ReturnStatement') {
		return isJsxExpression(statement.argument)
	}

	return (
		statement.type === 'BlockStatement' &&
		statement.body.some(
			(child) =>
				child.type === 'ReturnStatement' && isJsxExpression(child.argument),
		)
	)
}

/** `isThread ? <A /> : <B />`, `isThread && <A />`, `if (isThread) return <A />` → the JSX branches it picks between. */
function getJsxBranches(node) {
	if (node.type === 'ConditionalExpression') {
		return isJsxExpression(node.consequent) || isJsxExpression(node.alternate)
			? [node.consequent, node.alternate]
			: null
	}

	if (node.type === 'LogicalExpression') {
		return node.operator === '&&' && isJsxExpression(node.right)
			? [node.right]
			: null
	}

	if (node.type === 'IfStatement') {
		return returnsJsxStatement(node.consequent) ? [node.consequent] : null
	}

	return null
}

function unwrapNegation(node) {
	return node.type === 'UnaryExpression' && node.operator === '!'
		? unwrapNegation(node.argument)
		: node
}

function contains(container, node) {
	return (
		node.range[0] >= container.range[0] && node.range[1] <= container.range[1]
	)
}

export const noBooleanModePropsRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow components that switch what they render on several boolean props; compose explicit variants instead.',
			guidelineRuleId: 'architecture-avoid-boolean-props',
		},

		schema: [
			{
				type: 'object',
				properties: {
					max: {
						type: 'integer',
						minimum: 0,
						description:
							'How many props may toggle rendered JSX before the component is reported (default: 1).',
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			noBooleanModeProps:
				'`{{componentName}}` switches what it renders on {{count}} props ({{propNames}}). Each flag doubles the possible states. Turn it into a compound component: split the markup into separately exported parts (`{{componentName}}Frame`, `{{componentName}}{{partName}}`, …, not `{{componentName}}.{{partName}}`) that read shared state from a context provider via `use()`, then build explicit variants that compose only the parts they need (e.g. {{variantNames}}). Renaming the props does not fix this. See vercel-composition-patterns: architecture-avoid-boolean-props, architecture-compound-components.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const max = context.options[0]?.max ?? 1

		/** Component function → prop names that toggle JSX. */
		const modePropsByComponent = new Map()

		/** `isThread` or `props.isThread` → the prop variable and its name, when it belongs to a component's parameters. */
		function getProp(test) {
			const node = unwrapNegation(test)

			const identifier =
				node.type === 'MemberExpression' && !node.computed ? node.object : node

			if (identifier.type !== 'Identifier') {
				return null
			}

			const reference = sourceCode
				.getScope(identifier)
				.references.find((ref) => ref.identifier === identifier)
			const definition = reference?.resolved?.defs[0]

			if (definition?.type !== 'Parameter') {
				return null
			}

			const component = definition.node
			const componentName = getComponentName(component)

			if (!componentName || !COMPONENT_NAME.test(componentName)) {
				return null
			}

			// `props.isThread` reads a member; a destructured `isThread` is its own variable
			const name = node === identifier ? identifier.name : node.property.name

			return {
				component,
				variable: reference.resolved,
				name,
				isMember: node !== identifier,
			}
		}

		function checkBranch(node) {
			const branches = getJsxBranches(node)
			const test = node.type === 'LogicalExpression' ? node.left : node.test

			if (!branches) {
				return
			}

			const prop = getProp(test)

			if (!prop) {
				return
			}

			// `error && <Error message={error} />` renders data, it does not pick a mode
			const isUsedAsData = prop.variable.references.some(
				(ref) =>
					!contains(test, ref.identifier) &&
					(!prop.isMember ||
						ref.identifier.parent.property?.name === prop.name) &&
					branches.some((branch) => branch && contains(branch, ref.identifier)),
			)

			if (isUsedAsData) {
				return
			}

			const names = modePropsByComponent.get(prop.component) ?? new Set()
			names.add(prop.name)
			modePropsByComponent.set(prop.component, names)
		}

		function reportComponent(fn) {
			const names = modePropsByComponent.get(fn)

			if (!names || names.size <= max) {
				return
			}

			context.report({
				node: fn.type === 'FunctionDeclaration' ? fn.id : fn.parent.id,
				messageId: 'noBooleanModeProps',
				data: {
					componentName: getComponentName(fn),
					count: names.size,
					propNames: [...names].map((name) => `\`${name}\``).join(', '),
					partName: toCompoundPartName([...names][0]),
					variantNames: [...names]
						.map(
							(name) =>
								`\`${toCompoundPartName(name)}${getComponentName(fn)}\``,
						)
						.join(', '),
				},
			})
		}

		/**
		 * Checks:
		 * function Dialog({ isOpen }) { return isOpen ? <Panel /> : null } ✅ (one mode)
		 * function Field({ error }) { return error && <Error message={error} /> } ✅ (renders data)
		 * function Composer({ isThread, isEditing }) {
		 *   return <form>{isThread && <AlsoSend />}{isEditing ? <EditActions /> : <Actions />}</form>
		 * } ❌ (two modes → four states)
		 */
		return {
			ConditionalExpression: checkBranch,
			LogicalExpression: checkBranch,
			IfStatement: checkBranch,
			'FunctionDeclaration:exit': reportComponent,
			'ArrowFunctionExpression:exit': reportComponent,
			'FunctionExpression:exit': reportComponent,
		}
	},
}
