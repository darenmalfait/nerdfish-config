import { ruleTester } from '../rule-tester.js'

import { featureFolderStructureRule } from './feature-folder-structure.js'

const CODE = 'export {}'

ruleTester.run('feature-folder-structure', featureFolderStructureRule, {
	valid: [
		{ code: CODE, filename: 'src/features/users/components/users-list.tsx' },
		{ code: CODE, filename: 'src/features/users/api/get-users.ts' },
		{
			code: CODE,
			filename: 'src/features/users/components/form/user-form.tsx',
		},
		{ code: CODE, filename: 'src/modules/users/hooks/use-user.ts' },
		{
			code: CODE,
			filename: 'src/features/users/components/__tests__/users-list.tsx',
		},
		{ code: CODE, filename: 'src/features/users/__tests__/users.test.ts' },
		{ code: CODE, filename: 'src/components/ui/button.tsx' },
		{ code: CODE, filename: 'src/features.ts' },
		{
			code: CODE,
			filename: 'src/domains/users/queries/get-users.ts',
			options: [{ roots: ['domains'], folders: ['queries'] }],
		},
		{
			code: CODE,
			filename: 'src/modules/users/users.tsx',
			options: [{ roots: ['features'] }],
		},
	],
	invalid: [
		{
			code: CODE,
			filename: 'src/features/index.ts',
			errors: [
				{
					messageId: 'fileInRoot',
					data: { name: 'index.ts', root: 'features' },
				},
			],
		},
		{
			code: CODE,
			filename: 'src/features/users/users.tsx',
			errors: [{ messageId: 'fileInFeature' }],
		},
		{
			code: CODE,
			filename: 'src/modules/users/index.ts',
			errors: [{ messageId: 'fileInFeature' }],
		},
		{
			code: CODE,
			filename: 'src/features/users/helpers/format-name.ts',
			errors: [
				{
					messageId: 'unknownFolder',
					data: {
						folder: 'helpers',
						folders:
							'`api`, `assets`, `components`, `hooks`, `providers`, `types`, `utils`',
					},
				},
			],
		},
		{
			code: CODE,
			filename: 'src/features/users/api/get-users.ts',
			options: [{ folders: ['queries'] }],
			errors: [{ messageId: 'unknownFolder' }],
		},
	],
})
