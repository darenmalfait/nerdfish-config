import {
	getMemberPropertyName,
	isFunctionNode,
	isJsxExpression,
} from '../util.js'

/** PascalCase: `Discussion`, `CommentList`. */
const COMPONENT_NAME = /^[A-Z]/
const MAP_METHODS = new Set(['flatMap', 'map'])
const WRAPPERS = new Set([
	'forwardRef',
	'memo',
	'React.forwardRef',
	'React.memo',
])

function isFunction(node) {
	return isFunctionNode(node) || node?.type === 'FunctionDeclaration'
}

function getCalleeName(callee) {
	if (callee.type === 'Identifier') {
		return callee.name
	}

	return callee.type === 'MemberExpression' &&
		callee.object.type === 'Identifier'
		? `${callee.object.name}.${getMemberPropertyName(callee)}`
		: null
}

/** `function Foo() {}`, `const Foo = () => {}` and `const Foo = memo(() => {})` → `Foo`. */
function getFunctionName(fn) {
	if (fn.type === 'FunctionDeclaration') {
		return fn.id?.name ?? null
	}

	let node = fn.parent

	if (
		node?.type === 'CallExpression' &&
		WRAPPERS.has(getCalleeName(node.callee))
	) {
		node = node.parent
	}

	return node?.type === 'VariableDeclarator' && node.id.type === 'Identifier'
		? node.id.name
		: null
}

/** The variable a render function is declared as: `function renderRow() {}`, `const renderRow = () => …`, or wrapped in `useCallback`. */
function getDeclaredVariable(sourceCode, fn) {
	if (fn.type === 'FunctionDeclaration') {
		return sourceCode
			.getDeclaredVariables(fn)
			.find((variable) => variable.defs[0]?.type === 'FunctionName')
	}

	let node = fn.parent

	if (
		node?.type === 'CallExpression' &&
		node.arguments[0] === fn &&
		['React.useCallback', 'useCallback'].includes(getCalleeName(node.callee))
	) {
		node = node.parent
	}

	return node?.type === 'VariableDeclarator' && node.id.type === 'Identifier'
		? sourceCode.getDeclaredVariables(node)[0]
		: null
}

function getEnclosingFunction(node) {
	let current = node.parent

	while (current && !isFunction(current)) {
		current = current.parent
	}

	return current
}

/**
 * How a reference uses the function: called, mapped over, or handed to
 * something else (a prop, a library callback, an object) whose API we don't
 * control.
 */
function toUsage(reference) {
	const { identifier } = reference
	const { parent } = identifier

	if (parent.type === 'CallExpression' && parent.callee === identifier) {
		return 'called'
	}

	if (
		parent.type === 'CallExpression' &&
		parent.arguments[0] === identifier &&
		parent.callee.type === 'MemberExpression' &&
		MAP_METHODS.has(getMemberPropertyName(parent.callee))
	) {
		return 'mapped'
	}

	return 'passed'
}

/** `renderComment` → `Comment`, `getEmptyState` → `EmptyState`. */
function toComponentName(name) {
	const base = name.replace(/^(render|get|build|create|make)(?=[A-Z])/, '')

	return base[0].toUpperCase() + base.slice(1)
}

export const noRenderFunctionsRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow functions inside a component that return JSX and are called or mapped over; extract a component instead.',
			url: 'https://github.com/alan2207/bulletproof-react/blob/master/docs/components-and-styling.md',
		},

		schema: [],

		messages: {
			calledRenderFunction:
				'`{{name}}` returns JSX from inside `{{component}}`, so it is a component without the benefits of one. Extract it into its own component next to `{{component}}`: `function {{suggested}}({ … }: {{suggested}}Props) { return … }`, and render it as `<{{suggested}} … />`, passing what it reads from `{{component}}` as props. As a component it can use hooks, shows up in React DevTools, and React can skip re-rendering it. Moving `{{name}}` out of `{{component}}` or wrapping it in `useCallback` keeps the same problem.',
			mappedRenderFunction:
				'`{{name}}` renders each list item from inside `{{component}}`. Extract it into its own component and map to it: `{items.map((item) => <{{suggested}} key={item.id} item={item} />)}`, passing anything else it reads from `{{component}}` as props. As a component it can use hooks, shows up in React DevTools, React can skip re-rendering unchanged items, and the `key` sits where the list is rendered. Moving `{{name}}` out of `{{component}}` or wrapping it in `useCallback` keeps the same problem.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const jsxFunctions = new Set()

		function addIfJsx(fn, returned) {
			if (fn && isJsxExpression(returned)) {
				jsxFunctions.add(fn)
			}
		}

		function check(fn) {
			const variable = getDeclaredVariable(sourceCode, fn)

			if (!variable || COMPONENT_NAME.test(variable.name)) {
				return
			}

			const component = getEnclosingFunction(fn)
			const componentName = component && getFunctionName(component)

			if (!componentName || !COMPONENT_NAME.test(componentName)) {
				return
			}

			const usages = new Set(
				variable.references
					.filter((reference) => reference.isRead())
					.map(toUsage),
			)

			// Also handed to a prop or library: that API decides the shape.
			if (usages.has('passed')) {
				return
			}

			const messageId = usages.has('mapped')
				? 'mappedRenderFunction'
				: usages.has('called')
					? 'calledRenderFunction'
					: null

			if (!messageId) {
				return
			}

			context.report({
				node: variable.defs[0].name,
				messageId,
				data: {
					name: variable.name,
					component: componentName,
					suggested: toComponentName(variable.name),
				},
			})
		}

		/**
		 * Checks, inside function Discussion() {}:
		 * const renderComment = (comment) => <li>{comment.body}</li> + comments.map(renderComment) ❌ mapped
		 * function renderEmpty() { return <p>No comments</p> } + {renderEmpty()} ❌ called
		 * comments.map((comment) => <li>{comment.body}</li>) ✅ inline JSX
		 * <List renderItem={renderItem} /> ✅ render prop, the receiving API decides
		 * columnHelper.accessor('name', { cell: renderCell }) ✅ library callback
		 */
		return {
			ArrowFunctionExpression(node) {
				if (node.body.type !== 'BlockStatement') {
					addIfJsx(node, node.body)
				}
			},
			ReturnStatement(node) {
				addIfJsx(getEnclosingFunction(node), node.argument)
			},
			'Program:exit'() {
				for (const fn of jsxFunctions) {
					check(fn)
				}
			},
		}
	},
}
