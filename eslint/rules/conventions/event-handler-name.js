import { getCallName, isFunctionNode } from '../util.js'

const MEMOIZED_HANDLER_HOOKS = new Set(['useCallback', 'useMemo'])

export const eventHandlerNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require locally defined DOM event handler identifiers to start with handle.',
			guidelineRuleId: 'event-handler-prefix',
		},

		schema: [],

		messages: {
			eventHandlerPrefix:
				'Use a handle* name for local DOM event handlers passed to {{attributeName}}.',
		},
	},

	create(context) {
		/**
		 * React DOM event props:
		 * onClick
		 * onChange
		 * onSubmit
		 * etc.
		 */
		function isDomEventHandlerAttribute(attributeName) {
			return /^on[A-Z]/.test(attributeName)
		}

		function isMemoizedHandlerDefinition(init) {
			if (init?.type !== 'CallExpression') {
				return false
			}

			const hookName = getCallName(init.callee)

			if (!hookName || !MEMOIZED_HANDLER_HOOKS.has(hookName)) {
				return false
			}

			return isFunctionNode(init.arguments[0])
		}

		function isLocallyDefinedHandler(definition) {
			if (!definition || isBindingFromFunctionParams(definition)) {
				return false
			}

			switch (definition.type) {
				case 'Parameter':
				case 'ImportBinding':
					return false
				case 'FunctionName':
					return true
				case 'Variable': {
					const { init } = definition.node

					return (
						isFunctionNode(init) || isMemoizedHandlerDefinition(init)
					)
				}
				default:
					return false
			}
		}

		function referenceUsesIdentifier(reference, identifier) {
			if (reference.identifier === identifier) {
				return true
			}

			return (
				reference.identifier.name === identifier.name &&
				reference.identifier.range[0] === identifier.range[0] &&
				reference.identifier.range[1] === identifier.range[1]
			)
		}

		function nodeContains(root, target) {
			if (!root || typeof root !== 'object' || !target) {
				return false
			}

			if (root === target) {
				return true
			}

			for (const key of Object.keys(root)) {
				if (key === 'parent') {
					continue
				}

				const value = root[key]

				if (Array.isArray(value)) {
					for (const item of value) {
						if (
							item &&
							typeof item === 'object' &&
							item.type &&
							nodeContains(item, target)
						) {
							return true
						}
					}
				} else if (
					value &&
					typeof value === 'object' &&
					value.type &&
					nodeContains(value, target)
				) {
					return true
				}
			}

			return false
		}

		function isBindingFromFunctionParams(definition) {
			if (!definition) {
				return false
			}

			if (definition.type === 'Parameter') {
				return true
			}

			const nameNode =
				definition.name?.type === 'Identifier' ? definition.name : null

			if (!nameNode) {
				return false
			}

			let { parent } = nameNode

			while (parent) {
				if (
					parent.type === 'FunctionDeclaration' ||
					parent.type === 'FunctionExpression' ||
					parent.type === 'ArrowFunctionExpression'
				) {
					return parent.params.some((param) => nodeContains(param, nameNode))
				}

				parent = parent.parent
			}

			return false
		}

		function resolveHandlerDefinition(identifier) {
			let scope = context.sourceCode.getScope(identifier)

			while (scope) {
				const variable = scope.set.get(identifier.name)

				if (
					variable?.references.some((reference) =>
						referenceUsesIdentifier(reference, identifier),
					)
				) {
					return variable.defs[0] ?? null
				}

				scope = scope.upper
			}

			return null
		}

		/**
		 * Checks:
		 * <button onClick={handleClick} /> ✅ (local)
		 * <button onClick={onClick} /> ✅ (prop / forwarded)
		 * <button onClick={submitForm} /> ❌ (local, bad name)
		 */
		return {
			JSXAttribute(node) {
				// Ensure attribute has a name
				if (!node.name || node.name.type !== 'JSXIdentifier') {
					return
				}

				const attributeName = node.name.name

				// Only care about React event handlers
				if (!isDomEventHandlerAttribute(attributeName)) {
					return
				}

				// Ensure:
				// onClick={something}
				if (!node.value || node.value.type !== 'JSXExpressionContainer') {
					return
				}

				const expression = node.value.expression

				// Ignore inline callbacks:
				// onClick={() => {}}
				// onClick={function() {}}
				if (
					expression.type === 'ArrowFunctionExpression' ||
					expression.type === 'FunctionExpression'
				) {
					return
				}

				// Only validate identifiers:
				// onClick={handleClick}
				if (expression.type !== 'Identifier') {
					return
				}

				const handlerName = expression.name

				if (handlerName.startsWith('handle')) {
					return
				}

				const definition = resolveHandlerDefinition(expression)

				if (!isLocallyDefinedHandler(definition)) {
					return
				}

				context.report({
					node: expression,
					messageId: 'eventHandlerPrefix',
					data: {
						attributeName,
					},
				})
			},
		}
	},
}
