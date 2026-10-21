import { getCallName, isFunctionNode } from '../util.js'

const EFFECT_HOOKS = new Set([
	'useEffect',
	'useInsertionEffect',
	'useLayoutEffect',
])

function isWithin(node, container) {
	return (
		node.range[0] >= container.range[0] && node.range[1] <= container.range[1]
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

function isRefVariable(variable) {
	const init = variable.defs[0]?.node?.init

	return (
		init?.type === 'CallExpression' && getCallName(init.callee) === 'useRef'
	)
}

/**
 * `user.id` / `user?.id` when the reference is a plain property read, else
 * null. Method calls (`user.save()`), writes, `.current` and computed access
 * keep the whole object as the dependency.
 */
function getPropertyRead(identifier) {
	const member = identifier.parent

	if (
		member.type !== 'MemberExpression' ||
		member.object !== identifier ||
		member.computed ||
		member.property.name === 'current'
	) {
		return null
	}

	const { parent } = member

	if (
		(parent.type === 'CallExpression' && parent.callee === member) ||
		(parent.type === 'AssignmentExpression' && parent.left === member) ||
		parent.type === 'UpdateExpression' ||
		(parent.type === 'UnaryExpression' && parent.operator === 'delete')
	) {
		return null
	}

	return `${identifier.name}${member.optional ? '?.' : '.'}${member.property.name}`
}

export const narrowEffectDepsRule = {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,

		docs: {
			description:
				'Prefer the properties an effect reads over the whole object as a dependency.',
			guidelineRuleId: 'rerender-dependencies',
		},

		schema: [],

		messages: {
			narrowDependency:
				'The effect only reads {{properties}} from `{{name}}`, but re-runs whenever `{{name}}` changes identity. Depend on {{properties}} instead.',
			useProperties: 'Replace `{{name}}` with {{properties}}.',
		},
	},

	create(context) {
		const { sourceCode } = context

		/**
		 * Checks:
		 * useEffect(() => log(user.id), [user.id]) ✅
		 * useEffect(() => save(user), [user]) ✅ (uses the object itself)
		 * useEffect(() => user.save(), [user]) ✅ (method call needs `this`)
		 * useEffect(() => log(user.id), [user]) ❌
		 */
		return {
			CallExpression(node) {
				if (!EFFECT_HOOKS.has(getCallName(node.callee))) {
					return
				}

				const [callback, deps] = node.arguments

				if (!isFunctionNode(callback) || deps?.type !== 'ArrayExpression') {
					return
				}

				const depTexts = new Set(
					deps.elements
						.filter(Boolean)
						.map((element) => sourceCode.getText(element)),
				)

				for (const dep of deps.elements) {
					if (dep?.type !== 'Identifier') {
						continue
					}

					const variable = findVariable(sourceCode.getScope(dep), dep.name)

					if (!variable || isRefVariable(variable)) {
						continue
					}

					const reads = variable.references
						.filter((reference) => isWithin(reference.identifier, callback))
						.map((reference) => getPropertyRead(reference.identifier))

					if (reads.length === 0 || reads.includes(null)) {
						continue
					}

					const properties = [...new Set(reads)]
					// Skip when a narrowed path would duplicate an existing dep.
					if (properties.some((property) => depTexts.has(property))) {
						continue
					}

					const formatted = properties
						.map((property) => `\`${property}\``)
						.join(', ')

					context.report({
						node: dep,
						messageId: 'narrowDependency',
						data: { name: dep.name, properties: formatted },
						suggest: [
							{
								messageId: 'useProperties',
								data: { name: dep.name, properties: formatted },
								fix: (fixer) => fixer.replaceText(dep, properties.join(', ')),
							},
						],
					})
				}
			},
		}
	},
}
