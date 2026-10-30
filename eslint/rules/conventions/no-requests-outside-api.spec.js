import { ruleTester } from '../rule-tester.js'

import { noRequestsOutsideApiRule } from './no-requests-outside-api.js'

const COMPONENT_FILE =
	'src/features/discussions/components/discussions-list.tsx'
const API_FILE = 'src/features/discussions/api/get-discussions.ts'
const HOOKS_HINT =
	" Hooks that own a request are API hooks: bulletproof-react's `api/` holds the feature's 'request declarations and api hooks', next to their fetcher. `hooks/` is for the feature's other hooks, which can call API hooks or spread their options."
const QUERY_IMPORT =
	"import { useMutation, useQuery, queryOptions } from '@tanstack/react-query'\n"

ruleTester.run('no-requests-outside-api', noRequestsOutsideApiRule, {
	valid: [
		{
			code: `${QUERY_IMPORT}export const getDiscussions = () => apiClient.get('/discussions')
export const getDiscussionsQueryOptions = () => queryOptions({ queryKey: ['discussions'], queryFn: getDiscussions })
export const useDiscussions = () => useQuery(getDiscussionsQueryOptions())`,
			filename: API_FILE,
		},
		{
			code: 'export const getDiscussion = (id) => fetch(`/api/discussions/${id}`)',
			filename: 'src/features/discussions/api/queries/get-discussion.ts',
		},
		{
			code: `${QUERY_IMPORT}const discussions = useQuery({ ...getDiscussionsQueryOptions(), select: toTitles })`,
			filename: COMPONENT_FILE,
		},
		{
			code: `${QUERY_IMPORT}const discussions = useQuery(getDiscussionsQueryOptions())`,
			filename: COMPONENT_FILE,
		},
		{
			code: 'const discussions = useDiscussions({ page })',
			filename: COMPONENT_FILE,
		},
		{
			code: "import useSWR from 'swr'\nconst { data } = useSWR('/api/discussions')",
			filename: COMPONENT_FILE,
		},
		{
			// Not a request: helpers on the client, or a chained call on the result
			code: 'if (axios.isAxiosError(error)) {}\nconst instance = ky.extend({ prefixUrl })',
			filename: COMPONENT_FILE,
		},
		{
			// A local `fetch`, not the global
			code: 'const { fetch } = useLoader()\nfetch()',
			filename: COMPONENT_FILE,
		},
		{
			// Some other library's `useQuery`
			code: "import { useQuery } from '@apollo/client'\nuseQuery(GET_DISCUSSIONS, { queryFn: x })",
			filename: COMPONENT_FILE,
		},
		{
			code: "fetch('/api/discussions')",
			filename:
				'src/features/discussions/components/__tests__/discussions-list.test.tsx',
		},
		{
			code: "fetch('/api/discussions')",
			filename:
				'src/features/discussions/components/discussions-list.stories.tsx',
		},
		{
			// Outside features: routes, shared lib
			code: "fetch('/api/discussions')",
			filename: 'src/lib/api-client.ts',
		},
		{
			code: "fetch('/api/discussions')",
			filename: 'src/app/routes/discussions.tsx',
		},
	],
	invalid: [
		{
			code: `${QUERY_IMPORT}const discussions = useQuery({ queryKey: ['discussions', page], queryFn: () => getDiscussions(page) })`,
			filename: COMPONENT_FILE,
			errors: [
				{
					messageId: 'inlineQuery',
					data: {
						hook: 'useQuery',
						useHook: 'useQuery',
						folder: 'components',
						hint: '',
						kebab: 'discussions',
						pascal: 'Discussions',
					},
				},
			],
		},
		{
			// The query key names the example, and the inner `fetch` is not reported again
			code: `import { useSuspenseQuery as useQ } from '@tanstack/react-query'
const user = useQ({ queryKey: ['userProfile', id], queryFn: () => fetch('/api/me') })`,
			filename: 'src/features/users/hooks/use-profile.ts',
			errors: [
				{
					messageId: 'inlineQuery',
					data: {
						hook: 'useQ',
						useHook: 'useQ',
						folder: 'hooks',
						hint: HOOKS_HINT,
						kebab: 'user-profile',
						pascal: 'UserProfile',
					},
				},
			],
		},
		{
			code: `${QUERY_IMPORT}const options = queryOptions({ queryKey: ['discussions'], queryFn: getDiscussions })`,
			filename: COMPONENT_FILE,
			errors: [{ messageId: 'inlineQuery' }],
		},
		{
			code: `import { useQueries } from '@tanstack/react-query'
useQueries({ queries: [{ queryKey: ['a'], queryFn: getA }] })`,
			filename: COMPONENT_FILE,
			errors: [{ messageId: 'inlineQuery' }],
		},
		{
			code: `${QUERY_IMPORT}const create = useMutation({ mutationFn: createDiscussion, onSuccess: close })`,
			filename: 'src/features/discussions/components/create-discussion.tsx',
			errors: [
				{
					messageId: 'inlineMutation',
					data: {
						hook: 'useMutation',
						useHook: 'useMutation',
						folder: 'components',
						hint: '',
						kebab: 'discussion',
						pascal: 'Discussion',
					},
				},
			],
		},
		{
			code: "import useSWR from 'swr'\nconst { data } = useSWR('/api/user-profile?tab=1', fetcher)",
			filename: COMPONENT_FILE,
			errors: [
				{
					messageId: 'inlineSwr',
					data: {
						hook: 'useSWR',
						useHook: 'useSWR',
						folder: 'components',
						hint: '',
						kebab: 'user-profile',
						pascal: 'UserProfile',
					},
				},
			],
		},
		{
			code: "import useSWRMutation from 'swr/mutation'\nconst { trigger } = useSWRMutation('/api/discussions', createDiscussion)",
			filename: COMPONENT_FILE,
			errors: [{ messageId: 'inlineMutation' }],
		},
		{
			code: "const response = await fetch('/api/discussions')",
			filename: COMPONENT_FILE,
			errors: [
				{
					messageId: 'directRequest',
					data: {
						callee: 'fetch',
						folder: 'components',
						hint: '',
						kebab: 'discussions',
						pascal: 'Discussions',
					},
				},
			],
		},
		{
			code: "axios.post('/api/discussions', body)\nky('/api/discussions')\napiClient.get('/discussions').then(toDiscussions)",
			filename: COMPONENT_FILE,
			errors: [
				{
					messageId: 'directRequest',
					data: {
						callee: 'axios.post',
						folder: 'components',
						hint: '',
						kebab: 'discussions',
						pascal: 'Discussions',
					},
				},
				{
					messageId: 'directRequest',
					data: {
						callee: 'ky',
						folder: 'components',
						hint: '',
						kebab: 'discussions',
						pascal: 'Discussions',
					},
				},
				{
					messageId: 'directRequest',
					data: {
						callee: 'apiClient.get',
						folder: 'components',
						hint: '',
						kebab: 'discussions',
						pascal: 'Discussions',
					},
				},
			],
		},
		{
			code: "export const useProfile = () => fetch('/api/me')",
			filename: 'src/features/users/hooks/use-profile.ts',
			errors: [
				{
					messageId: 'directRequest',
					data: {
						callee: 'fetch',
						folder: 'hooks',
						hint: HOOKS_HINT,
						kebab: 'users',
						pascal: 'Users',
					},
				},
			],
		},
		{
			code: "http.users.get('/users')",
			filename: 'src/modules/users/utils/load.ts',
			options: [{ clients: ['http'] }],
			errors: [{ messageId: 'directRequest' }],
		},
	],
})
