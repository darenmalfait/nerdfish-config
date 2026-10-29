import { canRename, getRenameFixes, isExported } from '../util.js'

const COMPONENT_NAME = /^[A-Z]/
const TYPE_DECLARATIONS = new Set([
	'TSInterfaceDeclaration',
	'TSTypeAliasDeclaration',
])

function getComponentName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name
	}

	return fn.parent?.type === 'VariableDeclarator' &&
		fn.parent.id.type === 'Identifier'
		? fn.parent.id.name
		: null
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

export const componentPropsNamingRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require a component’s own props type to be named after the component (`Button` → `ButtonProps`).',
			url: 'https://github.com/twentyhq/twenty/blob/main/packages/twenty-oxlint-rules/rules/component-props-naming.ts',
		},

		fixable: 'code',
		schema: [],

		messages: {
			invalidPropsTypeName:
				'Name the props type of `{{component}}` `{{expected}}` instead of `{{actual}}`, so it can be found and imported by the component’s name.',
		},
	},

	create(context) {
		const { sourceCode } = context

		function check(fn) {
			const component = getComponentName(fn)
			const typeReference = fn.params[0]?.typeAnnotation?.typeAnnotation

			if (
				!component ||
				!COMPONENT_NAME.test(component) ||
				typeReference?.type !== 'TSTypeReference' ||
				typeReference.typeName.type !== 'Identifier' ||
				typeReference.typeArguments
			) {
				return
			}

			const actual = typeReference.typeName.name
			const expected = `${component}Props`

			if (actual === expected) {
				return
			}

			const variable = findVariable(sourceCode.getScope(fn), actual)
			const definition = variable?.defs.find(({ node }) =>
				TYPE_DECLARATIONS.has(node.type),
			)

			// Imported types and types several components share are deliberate reuse, not this component's own props.
			if (!definition || variable.references.length !== 1) {
				return
			}

			const isFixable =
				!isExported(variable, definition.node) && canRename(variable, expected)

			context.report({
				node: typeReference,
				messageId: 'invalidPropsTypeName',
				data: { component, expected, actual },
				fix: isFixable
					? (fixer) =>
							getRenameFixes(fixer, definition.name, variable, expected)
					: null,
			})
		}

		/**
		 * Checks:
		 * type ButtonProps = {…}; function Button(props: ButtonProps) ✅
		 * function PrimaryButton(props: ButtonProps) ✅ imported or shared with other components
		 * function Card(props: PropsWithChildren<CardProps>) ✅ generic wrapper
		 * type Props = {…}; function Button(props: Props) ❌ → ButtonProps
		 * type ButtonProps = {…}; function IconButton({ icon }: ButtonProps) ❌ → IconButtonProps (only used here)
		 */
		return {
			FunctionDeclaration: check,
			FunctionExpression: check,
			ArrowFunctionExpression: check,
		}
	},
}
