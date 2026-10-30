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
	],
})
