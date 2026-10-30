import {
	DEFAULT_FEATURE_ROOTS,
	findFeatureRootIndex,
	getMemberPropertyName,
	getPathSegments,
} from '../util.js'

const API_FOLDER = 'api'
const DEFAULT_CLIENTS = ['apiClient', 'axios', 'ky']
/** `axios.get()` sends a request, `axios.isAxiosError()` doesn't. */
const HTTP_METHODS = new Set([
	'delete',
	'fetch',
	'get',
	'head',
	'options',
	'patch',
	'post',
	'put',
	'request',
])
const SWR_SOURCES = new Set(['swr', 'swr/infinite', 'swr/mutation'])
/** `hooks/` looks like the place for a `useDiscussions()` hook, so say why it isn't. */
const HOOKS_HINT =
	" Hooks that own a request are API hooks: bulletproof-react's `api/` holds the feature's 'request declarations and api hooks', next to their fetcher. `hooks/` is for the feature's other hooks, which can call API hooks or spread their options."

/** Imported name → which message it gets when it defines a request inline. */
const REQUEST_HOOKS = {
	'@tanstack/react-query': {
		infiniteQueryOptions: 'inlineQuery',
		mutationOptions: 'inlineMutation',
		queryOptions: 'inlineQuery',
		useInfiniteQuery: 'inlineQuery',
		useMutation: 'inlineMutation',
		useQueries: 'inlineQuery',
		useQuery: 'inlineQuery',
		useSuspenseInfiniteQuery: 'inlineQuery',
		useSuspenseQueries: 'inlineQuery',
		useSuspenseQuery: 'inlineQuery',
	},
	swr: { default: 'inlineSwr', useSWR: 'inlineSwr' },
	'swr/infinite': { default: 'inlineSwr' },
	'swr/mutation': { default: 'inlineMutation' },
}

const REQUEST_KEYS = new Set(['mutationFn', 'queryFn'])

/** Tests, mocks and stories stub requests on purpose. */
const TEST_FILE = /\.(test|spec|stories)\.[cm]?[jt]sx?$/
const TEST_FOLDERS = new Set(['__mocks__', '__tests__'])

function getKeyName(property) {
	if (property.type !== 'Property') {
		return null
	}

	return property.key.type === 'Identifier'
		? property.key.name
		: property.key.value
}

/** `{ queryKey, queryFn }`, also nested like `useQueries({ queries: [{ queryFn }] })`. */
function definesRequest(node) {
	if (node?.type === 'ObjectExpression') {
		return node.properties.some(
			(property) =>
				REQUEST_KEYS.has(getKeyName(property)) ||
				definesRequest(property.value),
		)
	}

	if (node?.type === 'ArrayExpression') {
		return node.elements.some(definesRequest)
	}

	return false
}

function getStringValue(node) {
	return node?.type === 'Literal' && typeof node.value === 'string'
		? node.value
		: null
}

/** `{ queryKey: ['discussions', page] }` or SWR's `'/api/discussions'` → `discussions`. */
function getRequestName(args) {
	const [first] = args
	const url = getStringValue(first)

	if (url) {
		return url.split('?')[0].split('/').findLast(Boolean) ?? null
	}

	const queryKey =
		first?.type === 'ObjectExpression' &&
		first.properties.find((property) => getKeyName(property) === 'queryKey')

	return queryKey && queryKey.value.type === 'ArrayExpression'
		? getStringValue(queryKey.value.elements[0])
		: null
}

/** `userProfile` / `user-profile` → `['user', 'profile']`. */
function toWords(name) {
	return name
		.replaceAll(/([a-z\d])([A-Z])/g, '$1 $2')
		.split(/[^a-z\d]+/i)
		.filter(Boolean)
		.map((word) => word.toLowerCase())
}

function toNames(name) {
	const words = toWords(name)

	return {
		kebab: words.join('-'),
		pascal: words.map((word) => word[0].toUpperCase() + word.slice(1)).join(''),
	}
}

/** Close enough for an example name: `discussions` → `discussion`. */
function toSingular(name) {
	return name.endsWith('s') && !name.endsWith('ss') ? name.slice(0, -1) : name
}

function getRootIdentifier(node) {
	let current = node

	while (current.type === 'MemberExpression') {
		current = current.object
	}

	return current.type === 'Identifier' ? current : null
}

function isGlobal(sourceCode, identifier) {
	for (
		let scope = sourceCode.getScope(identifier);
		scope;
		scope = scope.upper
	) {
		const variable = scope.set.get(identifier.name)

		if (variable) {
			return variable.defs.length === 0
		}
	}

	return true
}

export const noRequestsOutsideApiRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				"Require a feature's requests (`fetch`, API clients, inline TanStack Query and SWR definitions) to live in its `api/` folder.",
			url: 'https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md',
		},

		schema: [
			{
				type: 'object',
				properties: {
					roots: {
						type: 'array',
						items: { type: 'string', minLength: 1 },
						uniqueItems: true,
					},
					clients: {
						type: 'array',
						items: { type: 'string', minLength: 1 },
						uniqueItems: true,
						description: `Extra request clients whose calls count as requests, on top of: ${DEFAULT_CLIENTS.join(', ')}.`,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			inlineQuery:
				"`{{hook}}` defines a request inline in `{{folder}}/`. Requests live in the feature's `api/` folder, so every caller shares one query key, fetcher and response type. Move it to a file like `api/get-{{kebab}}.ts` that exports the fetcher `get{{pascal}}()` (calling the shared API client), `get{{pascal}}QueryOptions()` (`queryOptions({ queryKey, queryFn })`) and a `use{{pascal}}()` hook, then call `use{{pascal}}()` here. Adding UI-only options here is fine: `{{useHook}}({ ...get{{pascal}}QueryOptions(), select })`.{{hint}}",
			inlineMutation:
				"`{{hook}}` defines a request inline in `{{folder}}/`. Mutations live in the feature's `api/` folder, next to the queries they invalidate. Move it to a file like `api/create-{{kebab}}.ts` that exports the fetcher `create{{pascal}}()` (calling the shared API client) and a `useCreate{{pascal}}()` hook that owns the request and cache invalidation, then call `useCreate{{pascal}}({ onSuccess })` here for UI-only side effects like closing a dialog.{{hint}}",
			inlineSwr:
				"`{{hook}}` defines a request inline in `{{folder}}/`. Requests live in the feature's `api/` folder, so every caller shares one key, fetcher and response type. Move it to a file like `api/get-{{kebab}}.ts` that exports the fetcher `get{{pascal}}()` (calling the shared API client) and a `use{{pascal}}()` hook wrapping `{{hook}}`, then call `use{{pascal}}()` here.{{hint}}",
			directRequest:
				"`{{callee}}` sends a request from `{{folder}}/`. Requests live in the feature's `api/` folder, so components read data through one typed fetcher and hook instead of calling the network themselves. Move the call into a fetcher in a file like `api/get-{{kebab}}.ts` (`export function get{{pascal}}(…): Promise<…>`, using the shared API client from `lib/`), wrap it in a `use{{pascal}}()` hook there, and call the hook here.{{hint}}",
		},
	},

	create(context) {
		const { sourceCode } = context
		const options = context.options[0] || {}
		const roots = options.roots ?? DEFAULT_FEATURE_ROOTS
		const clients = new Set([...DEFAULT_CLIENTS, ...(options.clients ?? [])])
		const segments = getPathSegments(context)
		const rootIndex = findFeatureRootIndex(segments, roots)
		const folderIndex = rootIndex + 2
		const folder = segments[folderIndex]

		// Outside a feature, a loose file in its root (feature-folder-structure's
		// to report), already in `api/`, or a test.
		if (
			rootIndex === -1 ||
			folderIndex >= segments.length - 1 ||
			folder === API_FOLDER ||
			segments.some((segment) => TEST_FOLDERS.has(segment)) ||
			TEST_FILE.test(segments.at(-1))
		) {
			return {}
		}

		const feature = segments[rootIndex + 1]
		const hint = folder === 'hooks' ? HOOKS_HINT : ''
		/** Local name → hook, e.g. `useQ` → `{ messageId: 'inlineQuery' }` for `import { useQuery as useQ }`. */
		const requestHooks = new Map()
		const reportedHooks = new Set()

		function isInsideReportedHook(node) {
			for (let current = node.parent; current; current = current.parent) {
				if (reportedHooks.has(current)) {
					return true
				}
			}

			return false
		}

		function checkHook(node, hookName, { messageId, isSwr }) {
			// SWR takes the fetcher as its second argument: `useSWR(key, fetcher)`.
			const isInline = isSwr
				? node.arguments.length >= 2
				: node.arguments.some(definesRequest)

			if (!isInline) {
				return
			}

			const name =
				messageId === 'inlineMutation'
					? toSingular(feature)
					: (getRequestName(node.arguments) ?? feature)

			reportedHooks.add(node)
			context.report({
				node: node.callee,
				messageId,
				data: {
					hook: hookName,
					useHook: hookName.startsWith('use') ? hookName : 'useQuery',
					folder,
					hint,
					...toNames(name),
				},
			})
		}

		/**
		 * Checks, from features/discussions/components/discussions-list.tsx:
		 * useQuery({ queryKey: ['discussions'], queryFn: getDiscussions }) ❌ define it in api/
		 * useQuery({ ...getDiscussionsQueryOptions(), select: toTitles }) ✅ options from api/
		 * useDiscussions() ✅
		 * fetch('/api/discussions') / axios.get(…) / apiClient.post(…) ❌
		 * Any of these in features/discussions/api/ or a test ✅
		 */
		return {
			ImportDeclaration(node) {
				const hooks = REQUEST_HOOKS[node.source.value]

				if (!hooks) {
					return
				}

				for (const specifier of node.specifiers) {
					const importedName =
						specifier.type === 'ImportSpecifier'
							? (specifier.imported.name ?? specifier.imported.value)
							: 'default'

					if (hooks[importedName]) {
						requestHooks.set(specifier.local.name, {
							messageId: hooks[importedName],
							isSwr: SWR_SOURCES.has(node.source.value),
						})
					}
				}
			},
			CallExpression(node) {
				const { callee } = node

				if (callee.type === 'Identifier' && requestHooks.has(callee.name)) {
					checkHook(node, callee.name, requestHooks.get(callee.name))
					return
				}

				const root = getRootIdentifier(callee)
				const isClientCall =
					root &&
					clients.has(root.name) &&
					(callee === root || HTTP_METHODS.has(getMemberPropertyName(callee)))
				const isFetch =
					callee === root && root.name === 'fetch' && isGlobal(sourceCode, root)
				const isRequest = isClientCall || isFetch

				if (!isRequest || isInsideReportedHook(node)) {
					return
				}

				context.report({
					node: callee,
					messageId: 'directRequest',
					data: {
						callee: sourceCode.getText(callee),
						folder,
						hint,
						...toNames(feature),
					},
				})
			},
		}
	},
}
