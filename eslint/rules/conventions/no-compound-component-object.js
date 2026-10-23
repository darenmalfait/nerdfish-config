const COMPONENT_NAME = /^[A-Z][a-z]/

function isComponentReference(node) {
	return (
		(node?.type === 'Identifier' && COMPONENT_NAME.test(node.name)) ||
		node?.type === 'ArrowFunctionExpression' ||
		node?.type === 'FunctionExpression'
	)
}

function toKeyName(property) {
	if (property.type !== 'Property' || property.computed) {
		return null
	}

	return property.key.type === 'Identifier' ? property.key.name : null
}

/** `{ Header: ComposerHeader, Footer: ComposerFooter }` → `['Header', 'Footer']`. */
function getPartNames(object) {
	if (object?.type !== 'ObjectExpression' || object.properties.length === 0) {
		return null
	}

	const names = object.properties.map(toKeyName)

	const isPartsObject = object.properties.every(
		(property, index) =>
			names[index] &&
			COMPONENT_NAME.test(names[index]) &&
			isComponentReference(property.value),
	)

	return isPartsObject ? names : null
}

export const noCompoundComponentObjectRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow assembling compound parts as properties (`Composer.Header`); export each part as its own component (`ComposerHeader`).',
			guidelineRuleId: 'architecture-compound-components',
		},

		schema: [],

		messages: {
			noCompoundComponentObject:
				'`{{componentName}}` bundles its parts as properties ({{partNames}}). A Server Component cannot read properties off a client component, so `<{{componentName}}.{{firstPart}}>` breaks across the server/client boundary. Export each part as its own component instead (`export function {{componentName}}{{firstPart}}`) and render `<{{componentName}}{{firstPart}}>`.',
		},
	},

	create(context) {
		function report(node, componentName, partNames) {
			context.report({
				node,
				messageId: 'noCompoundComponentObject',
				data: {
					componentName,
					firstPart: partNames[0],
					partNames: partNames
						.map((name) => `\`${componentName}.${name}\``)
						.join(', '),
				},
			})
		}

		/**
		 * Checks:
		 * export function ComposerHeader() {} ✅
		 * const Composer = { Frame: ComposerFrame, Header: ComposerHeader } ❌
		 * const Composer = Object.assign(ComposerRoot, { Header: ComposerHeader }) ❌
		 * Composer.Header = ComposerHeader ❌
		 */
		return {
			VariableDeclarator(node) {
				if (
					node.id.type !== 'Identifier' ||
					!COMPONENT_NAME.test(node.id.name)
				) {
					return
				}

				const partNames = getPartNames(node.init)

				if (partNames) {
					report(node, node.id.name, partNames)
				}
			},

			CallExpression(node) {
				const { callee } = node

				if (
					callee.type !== 'MemberExpression' ||
					callee.object.name !== 'Object' ||
					callee.property.name !== 'assign' ||
					!isComponentReference(node.arguments[0])
				) {
					return
				}

				const partNames = getPartNames(node.arguments[1])

				if (!partNames) {
					return
				}

				const componentName =
					node.parent.type === 'VariableDeclarator' &&
					node.parent.id.type === 'Identifier'
						? node.parent.id.name
						: (node.arguments[0].name ?? 'Component')

				report(node, componentName, partNames)
			},

			AssignmentExpression(node) {
				const { left } = node

				if (
					left.type !== 'MemberExpression' ||
					left.computed ||
					left.object.type !== 'Identifier' ||
					!COMPONENT_NAME.test(left.object.name) ||
					!COMPONENT_NAME.test(left.property.name) ||
					!isComponentReference(node.right)
				) {
					return
				}

				report(node, left.object.name, [left.property.name])
			},
		}
	},
}
