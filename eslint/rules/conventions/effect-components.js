import {
	canRename,
	getCallName,
	getJsxElementName,
	getRenameFixes,
	isExported,
} from '../util.js'

const COMPONENT_NAME = /^[A-Z]/
const HOOK_NAME = /^use[A-Z]/
const SUFFIX = 'Effect'
const FRAGMENT_NAMES = new Set(['Fragment', 'React.Fragment'])

/** `<></>`, `<Fragment />` and `<React.Fragment></React.Fragment>`, ignoring whitespace-only text. */
function isEmptyFragment(node) {
	if (node.type !== 'JSXFragment' && node.type !== 'JSXElement') {
		return false
	}

	if (
		node.type === 'JSXElement' &&
		!FRAGMENT_NAMES.has(getJsxElementName(node.openingElement.name))
	) {
		return false
	}

	return node.children.every(
		(child) => child.type === 'JSXText' && child.value.trim() === '',
	)
}

function rendersNothing(argument) {
	return (
		!argument ||
		(argument.type === 'Literal' && argument.value === null) ||
		(argument.type === 'Identifier' && argument.name === 'undefined') ||
		isEmptyFragment(argument)
	)
}

/** Name of `function Foo() {}` or `const Foo = () => {}`, with the identifier to rename. */
function getComponentId(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id
	}

	return fn.parent?.type === 'VariableDeclarator' &&
		fn.parent.id.type === 'Identifier'
		? fn.parent.id
		: null
}

export const effectComponentsRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require components that only run hooks and render nothing to end in `Effect`, and reserve the suffix for them.',
			url: 'https://github.com/twentyhq/twenty/blob/main/packages/twenty-oxlint-rules/rules/effect-components.ts',
		},

		fixable: 'code',
		schema: [],

		messages: {
			addSuffix:
				'`{{name}}` renders nothing and only runs hooks. Name it `{{expected}}` so the tree shows at a glance which components exist for their side effects.',
			removeSuffix:
				'`{{name}}` renders UI, so the `Effect` suffix is misleading. Rename it to `{{expected}}`; the suffix is for components that render nothing.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const stack = []

		function report(fn, id, messageId, expected) {
			const declaration = fn.type === 'FunctionDeclaration' ? fn : fn.parent
			const variable = sourceCode
				.getDeclaredVariables(declaration)
				.find(({ name }) => name === id.name)
			const isFixable =
				variable &&
				!isExported(variable, declaration) &&
				canRename(variable, expected)

			context.report({
				node: id,
				messageId,
				data: { name: id.name, expected },
				fix: isFixable
					? (fixer) => getRenameFixes(fixer, id, variable, expected)
					: null,
			})
		}

		function enter(fn) {
			stack.push({ callsHook: false, rendersSomething: false })

			if (fn.expression && !rendersNothing(fn.body)) {
				stack.at(-1).rendersSomething = true
			}
		}

		function exit(fn) {
			const { callsHook, rendersSomething } = stack.pop()
			const id = getComponentId(fn)

			if (!id || !COMPONENT_NAME.test(id.name)) {
				return
			}

			const hasSuffix = id.name.endsWith(SUFFIX) && id.name !== SUFFIX

			if (!hasSuffix && callsHook && !rendersSomething) {
				report(fn, id, 'addSuffix', `${id.name}${SUFFIX}`)
			} else if (hasSuffix && rendersSomething) {
				report(fn, id, 'removeSuffix', id.name.slice(0, -SUFFIX.length))
			}
		}

		/**
		 * Checks:
		 * function TitleSyncEffect() { useEffect(…); return null } ✅
		 * function Profile({ user }) { if (!user) return null; return <Card /> } ✅ renders UI on some path
		 * const Placeholder = () => null ✅ no hooks, nothing to name
		 * function TitleSync() { useEffect(…); return null } ❌ → TitleSyncEffect
		 * function TitleSync() { useEffect(…) } ❌ implicit undefined renders nothing too
		 * function BannerEffect() { return <Banner /> } ❌ → Banner
		 */
		return {
			FunctionDeclaration: enter,
			FunctionExpression: enter,
			ArrowFunctionExpression: enter,
			'FunctionDeclaration:exit': exit,
			'FunctionExpression:exit': exit,
			'ArrowFunctionExpression:exit': exit,

			ReturnStatement(node) {
				if (stack.length > 0 && !rendersNothing(node.argument)) {
					stack.at(-1).rendersSomething = true
				}
			},

			CallExpression(node) {
				if (
					stack.length > 0 &&
					HOOK_NAME.test(getCallName(node.callee) ?? '')
				) {
					stack.at(-1).callsHook = true
				}
			},
		}
	},
}
