import { createRequire } from 'node:module'
import path from 'node:path'

import globals from 'globals'

import { getCallName, isFunctionNode, isJsxExpression } from '../util.js'

const COMPONENT_NAME = /^[A-Z][a-z]/
const HOOK_NAME = /^use[A-Z]/

/** Recent Node versions define these too, but reading them during render still breaks SSR. */
const SERVER_UNSAFE_GLOBALS = ['localStorage', 'navigator', 'sessionStorage']

const BROWSER_GLOBALS = new Set([
	...Object.keys(globals.browser).filter((name) => !(name in globals.node)),
	...SERVER_UNSAFE_GLOBALS,
])

/** Frameworks that render on the server, so module code runs there too. */
const SSR_FRAMEWORKS = [
	'@react-router/dev',
	'@remix-run/react',
	'@tanstack/react-start',
	'astro',
	'gatsby',
	'next',
	'waku',
]

/** Positions where a name refers to a type, not a runtime value. */
const TYPE_PARENTS = new Set([
	'TSClassImplements',
	'TSInterfaceHeritage',
	'TSQualifiedName',
	'TSTypeQuery',
	'TSTypeReference',
])

/** Scopes that sit inside a function without starting a new one. */
const BLOCK_SCOPES = new Set(['block', 'catch', 'for', 'switch', 'with'])

/** Hook arguments React calls during render: `useState(() => …)`, `useMemo(() => …)`, `useReducer(r, arg, init)`. */
const RENDER_CALLBACK_ARGUMENT = new Map([
	['useMemo', 0],
	['useReducer', 2],
	['useState', 0],
])

const ssrFrameworkByCwd = new Map()

function hasSsrFramework(cwd) {
	if (!ssrFrameworkByCwd.has(cwd)) {
		const require = createRequire(path.join(cwd, 'package.json'))

		ssrFrameworkByCwd.set(
			cwd,
			SSR_FRAMEWORKS.some((name) => {
				try {
					require.resolve(`${name}/package.json`)
					return true
				} catch {
					return false
				}
			}),
		)
	}

	return ssrFrameworkByCwd.get(cwd)
}

/** `typeof window` and type positions say nothing about runtime. */
function isTypeOnly(reference) {
	const { parent } = reference.identifier

	return (
		reference.isTypeReference ||
		(parent.type === 'UnaryExpression' && parent.operator === 'typeof') ||
		TYPE_PARENTS.has(parent.type)
	)
}

/** Name a function is bound to: `function Card`, `const Card = …`, `const Card = memo(…)`. */
function getFunctionName(fn) {
	if (fn.id) {
		return fn.id.name
	}

	let { parent } = fn

	if (parent.type === 'CallExpression') {
		parent = parent.parent
	}

	return parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier'
		? parent.id.name
		: null
}

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

function isRenderCallback(fn) {
	const call = fn.parent

	return (
		call.type === 'CallExpression' &&
		call.arguments[RENDER_CALLBACK_ARGUMENT.get(getCallName(call.callee))] ===
			fn
	)
}

/** Component and hook bodies, and the initializers React runs while rendering them. */
function isRenderFunction(fn) {
	const name = getFunctionName(fn)

	return (
		(name !== null && (COMPONENT_NAME.test(name) || HOOK_NAME.test(name))) ||
		returnsJsx(fn) ||
		(isFunctionNode(fn) && isRenderCallback(fn))
	)
}

/** The function or module scope the reference runs in, skipping block scopes. */
function getRunningScope(reference) {
	let scope = reference.from

	while (BLOCK_SCOPES.has(scope.type)) {
		scope = scope.upper
	}

	return scope
}

export const noBrowserGlobalsInRenderRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Disallow browser-only globals during render and, in server-rendered apps, at module scope.',
			url: 'https://github.com/WordPress/gutenberg/blob/trunk/packages/eslint-plugin/docs/rules/no-dom-globals-in-react-fc.md',
		},

		schema: [
			{
				type: 'object',
				properties: {
					moduleScope: {
						type: 'boolean',
						description:
							'Also report module-level access. Defaults to on when an SSR framework (Next.js, Remix, React Router, Astro, …) is installed.',
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			render:
				'`{{name}}` is read while rendering. It is undefined during server rendering, a `typeof` guard makes the first client render differ from the server (hydration mismatch), and the value never updates. Subscribe with `useSyncExternalStore` (with a server snapshot), or read it in an event handler or effect.',
			moduleScope:
				'`{{name}}` is read when this module loads, which crashes during server rendering. Read it inside a function that only runs in the browser, or guard it with `typeof {{name}} !== "undefined"`.',
		},
	},

	create(context) {
		const { sourceCode } = context
		const isModuleScopeChecked =
			context.options[0]?.moduleScope ?? hasSsrFramework(context.cwd)

		/** `typeof window !== 'undefined'`, directly or through a `const isBrowser = …`. */
		function isTypeofCheck(test) {
			let isFound = false

			function visit(node) {
				if (isFound || !node?.type || isFunctionNode(node)) {
					return
				}

				if (node.type === 'UnaryExpression' && node.operator === 'typeof') {
					isFound = true
					return
				}

				if (node.type === 'Identifier') {
					const definition = sourceCode
						.getScope(node)
						.references.find((reference) => reference.identifier === node)
						?.resolved?.defs[0]

					if (
						definition?.type === 'Variable' &&
						definition.parent.kind === 'const'
					) {
						visit(definition.node.init)
					}
					return
				}

				for (const key of sourceCode.visitorKeys[node.type] ?? []) {
					const child = node[key]
					for (const item of Array.isArray(child) ? child : [child]) {
						visit(item)
					}
				}
			}

			visit(test)
			return isFound
		}

		/** Inside the guarded branch of `if (typeof window …)`, `typeof window … ? … : …` or `typeof window … && …`. */
		function isGuarded(node) {
			for (
				let child = node, current = node.parent;
				current;
				child = current, current = current.parent
			) {
				const isGuardedBranch =
					((current.type === 'IfStatement' ||
						current.type === 'ConditionalExpression') &&
						child !== current.test &&
						isTypeofCheck(current.test)) ||
					(current.type === 'LogicalExpression' &&
						child === current.right &&
						isTypeofCheck(current.left))

				if (isGuardedBranch) {
					return true
				}
			}

			return false
		}

		function check(reference) {
			const { name } = reference.identifier

			if (!BROWSER_GLOBALS.has(name) || isTypeOnly(reference)) {
				return
			}

			const scope = getRunningScope(reference)

			if (scope.type === 'function' && isRenderFunction(scope.block)) {
				context.report({
					node: reference.identifier,
					messageId: 'render',
					data: { name },
				})
				return
			}

			if (
				isModuleScopeChecked &&
				(scope.type === 'module' || scope.type === 'global') &&
				!isGuarded(reference.identifier)
			) {
				context.report({
					node: reference.identifier,
					messageId: 'moduleScope',
					data: { name },
				})
			}
		}

		/**
		 * Checks:
		 * function Card() { useEffect(() => { setWidth(window.innerWidth) }, []) } ✅
		 * function Card() { return <button onClick={() => window.print()} /> } ✅
		 * if (typeof window !== 'undefined') window.addEventListener(…) ✅ (module scope, guarded)
		 * function Card() { const width = window.innerWidth; return <div /> } ❌
		 * function useTheme() { return localStorage.getItem('theme') } ❌
		 * const [theme] = useState(() => localStorage.getItem('theme')) ❌
		 * const isMac = navigator.platform.startsWith('Mac') ❌ (module scope, SSR app)
		 */
		return {
			Program(node) {
				const globalScope = sourceCode.getScope(node)

				// Globals declared through `languageOptions.globals`, then undeclared ones.
				for (const variable of globalScope.variables) {
					if (variable.defs.length === 0) {
						variable.references.forEach(check)
					}
				}

				globalScope.through.forEach(check)
			},
		}
	},
}
