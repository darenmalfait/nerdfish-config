import { ruleTester } from '../rule-tester.js'

import { noCrossFeatureImportsRule } from './no-cross-feature-imports.js'

const FEATURE_FILE = 'src/features/comments/components/comments.tsx'
// A real folder next to a real `features/`, so the shared check applies.
const SHARED_FILE =
	'samples/app/conventions/feature-structure/components/avatar.tsx'

ruleTester.run('no-cross-feature-imports', noCrossFeatureImportsRule, {
	valid: [
		{
			code: "import { getComments } from '../api/get-comments'",
			filename: FEATURE_FILE,
		},
		{
			code: "import { getComments } from '@/features/comments/api/get-comments'",
			filename: FEATURE_FILE,
		},
		{
			code: "import { Button } from '@/components/ui/button'",
			filename: FEATURE_FILE,
		},
		{
			code: "import { features } from 'some-package/features/users'",
			filename: FEATURE_FILE,
		},
		{
			// Routes and pages compose features
			code: "import { Comments } from '@/features/comments/components/comments'\nimport { useUser } from '@/features/users/api/get-user'",
			filename: 'src/app/routes/discussion.tsx',
		},
		{
			// No `features/` next to it, so this `components/` is not shared code
			code: "import { useUser } from '@/features/users/api/get-user'",
			filename: 'src/app/routes/users/components/user-row.tsx',
		},
		{
			code: "import { Avatar } from '../../../components/avatar'",
			filename:
				'samples/app/conventions/feature-structure/features/users/components/user-card.tsx',
		},
		{
			code: "import { getUser } from '@/modules/users/api/get-user'",
			filename: 'src/modules/comments/api/get-comments.ts',
			options: [{ roots: ['features'] }],
		},
		{
			// Remix: `app/` is the root holding `features/`, not the app layer
			code: "import { Button } from '../../../components/ui/button'\nimport { env } from '~/config/env'",
			filename: 'app/features/comments/components/comments.tsx',
		},
		{
			code: "import { Button } from '#app/components/ui/button'",
			filename: 'app/features/comments/components/comments.tsx',
		},
		{
			// Routes compose the app layer itself
			code: "import { AppProvider } from '@/app/provider'",
			filename: 'src/app/routes/discussion.tsx',
		},
		{
			code: "import { AppProvider } from '@/app/provider'",
			filename: FEATURE_FILE,
			options: [{ app: ['shell'] }],
		},
		{
			code: "import { app } from 'some-package/app'",
			filename: FEATURE_FILE,
		},
	],
	invalid: [
		{
			code: "import { useUser } from '@/features/users/api/get-user'",
			filename: FEATURE_FILE,
			errors: [
				{
					messageId: 'crossFeatureImport',
					data: { feature: 'comments', target: 'users' },
				},
			],
		},
		{
			code: "import { useUser } from '../../users/api/get-user'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureImport' }],
		},
		{
			code: "import { getUser } from '~/modules/users/api/get-user'",
			filename: 'src/modules/comments/api/get-comments.ts',
			errors: [{ messageId: 'crossFeatureImport' }],
		},
		{
			code: "export { useUser } from '#app/features/users/api/get-user'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureImport' }],
		},
		{
			code: "export * from '@/features/users'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureImport' }],
		},
		{
			code: "const users = () => import('@/features/users/components/users-list')",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureComponentImport' }],
		},
		{
			code: "import { UserCard } from '@/features/users/components/user-card'",
			filename: FEATURE_FILE,
			errors: [
				{
					messageId: 'crossFeatureComponentImport',
					data: { feature: 'comments', target: 'users' },
				},
			],
		},
		{
			code: "import type { User } from '@/features/users/api/get-user'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureTypeImport' }],
		},
		{
			code: "import { type User } from '@/features/users'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureTypeImport' }],
		},
		{
			code: "import { User } from '@/features/users/types/user'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureTypeImport' }],
		},
		{
			code: "export type { User } from '@/features/users'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureTypeImport' }],
		},
		{
			// One value specifier is enough to couple the code, not just the types
			code: "import { type User, useUser } from '@/features/users'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'crossFeatureImport' }],
		},
		{
			code: "import { getUser } from '../features/users/api/get-user'",
			filename: SHARED_FILE,
			errors: [
				{
					messageId: 'sharedImportsFeature',
					data: { folder: 'components', target: 'users' },
				},
			],
		},
		{
			code: "import { getUser } from '@/features/users/api/get-user'",
			filename: SHARED_FILE,
			errors: [{ messageId: 'sharedImportsFeature' }],
		},
		{
			code: "import { AppProvider } from '@/app/provider'",
			filename: FEATURE_FILE,
			errors: [
				{
					messageId: 'featureImportsApp',
					data: { feature: 'comments', target: 'app' },
				},
			],
		},
		{
			code: "import { paths } from '../../../app/routes/paths'",
			filename: FEATURE_FILE,
			errors: [{ messageId: 'featureImportsApp' }],
		},
		{
			code: "import { loader } from '~/routes/discussion'",
			filename: 'app/features/comments/api/get-comments.ts',
			errors: [
				{
					messageId: 'featureImportsApp',
					data: { feature: 'comments', target: 'routes' },
				},
			],
		},
		{
			code: "import { loader } from '../../../routes/discussion'",
			filename: 'app/features/comments/api/get-comments.ts',
			errors: [{ messageId: 'featureImportsApp' }],
		},
		{
			code: "import { loader } from '#app/routes/discussion'",
			filename: 'app/features/comments/api/get-comments.ts',
			errors: [{ messageId: 'featureImportsApp' }],
		},
		{
			code: "import { Shell } from '@/shell/layout'",
			filename: FEATURE_FILE,
			options: [{ app: ['shell'] }],
			errors: [{ messageId: 'featureImportsApp' }],
		},
		{
			code: "import { AppProvider } from '@/app/provider'",
			filename: SHARED_FILE,
			errors: [
				{
					messageId: 'sharedImportsApp',
					data: { folder: 'components', target: 'app' },
				},
			],
		},
		{
			// `samples/app/…` sits above the feature root, so only this `app/` counts
			code: "import { AppProvider } from '../app/provider'",
			filename: SHARED_FILE,
			errors: [{ messageId: 'sharedImportsApp' }],
		},
	],
})
