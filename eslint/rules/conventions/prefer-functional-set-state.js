import { getCallName, isFunctionNode } from '../util.js'

function isWithin(node, container) {
	return node.range[0] >= container.range[0] && node.range[1] <= container.range[1]
}

function isNameVisible(scope, name) {
	for (let current = scope; current; current = current.upper) {
		if (current.set.has(name)) {
			return true
		}
	}

	return scope.through.some((reference) => reference.identifier.name === name)
}

/** [state, setter] variables from `const [state, setState] = useState(…)`. */
function getStatePair(context, declarator) {
	const { id, init } = declarator

	if (
		id.type !== 'ArrayPattern' ||
		id.elements.length !== 2 ||
		id.elements.some((element) => element?.type !== 'Identifier') ||
		init?.type !== 'CallExpression' ||
		getCallName(init.callee) !== 'useState'
	) {
		return null
	}

	const variables = context.sourceCode.getDeclaredVariables(declarator)
	const [stateName, setterName] = id.elements.map((element) => element.name)

	return {
		state: variables.find((variable) => variable.name === stateName),
		setter: variables.find((variable) => variable.name === setterName),
	}
}

export const preferFunctionalSetStateRule = {
	meta: {
		type: 'suggestion',
		hasSuggestions: true,

		docs: {
			description:
				'Require the functional updater when the next state is computed from the current state.',
			guidelineRuleId: 'rerender-functional-setstate',
		},

		schema: [],

		messages: {
			preferFunctionalSetState:
				'`{{setter}}` computes the next value from `{{state}}`, which can be stale inside callbacks and forces `{{state}}` into their deps. Use the updater form: `{{setter}}(({{prev}}) => …)`.',
			useUpdater: 'Use `{{setter}}(({{prev}}) => …)`.',
		},
	},

	create(context) {
		const { sourceCode } = context

		function buildFix(argument, stateReferences, prev) {
			return (fixer) => {
				const [start] = argument.range
				let text = sourceCode.getText(argument)

				// Replace back to front so earlier offsets stay valid.
				for (const { identifier } of stateReferences.toReversed()) {
					const { parent } = identifier
					const replacement =
						parent.type === 'Property' &&
						parent.shorthand &&
						parent.value === identifier
							? `${identifier.name}: ${prev}`
							: prev

					text =
						text.slice(0, identifier.range[0] - start) +
						replacement +
						text.slice(identifier.range[1] - start)
				}

				// `() => { … }` would parse as a block; `() => a, b` as two args.
				const body =
					argument.type === 'ObjectExpression' ||
					argument.type === 'SequenceExpression'
						? `(${text})`
						: text

				return fixer.replaceText(argument, `(${prev}) => ${body}`)
			}
		}

		/**
		 * Checks:
		 * setItems((prev) => [...prev, item]) ✅
		 * setItems([]) ✅ (does not read state)
		 * setItems([...items, item]) ❌
		 * setIsOpen(!isOpen) ❌
		 */
		return {
			VariableDeclarator(declarator) {
				const pair = getStatePair(context, declarator)

				if (!pair?.state || !pair.setter) {
					return
				}

				const { state, setter } = pair
				const prev = `prev${state.name[0].toUpperCase()}${state.name.slice(1)}`

				for (const { identifier } of setter.references) {
					const call = identifier.parent

					if (call.type !== 'CallExpression' || call.callee !== identifier) {
						continue
					}

					const [argument] = call.arguments

					if (!argument || isFunctionNode(argument)) {
						continue
					}

					const stateReferences = state.references.filter((reference) =>
						isWithin(reference.identifier, argument),
					)

					if (stateReferences.length === 0) {
						continue
					}

					const canFix = !isNameVisible(sourceCode.getScope(call), prev)

					context.report({
						node: call,
						messageId: 'preferFunctionalSetState',
						data: { setter: setter.name, state: state.name, prev },
						suggest: canFix
							? [
									{
										messageId: 'useUpdater',
										data: { setter: setter.name, prev },
										fix: buildFix(argument, stateReferences, prev),
									},
								]
							: [],
					})
				}
			},
		}
	},
}
