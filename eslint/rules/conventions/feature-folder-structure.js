import {
	DEFAULT_FEATURE_ROOTS,
	findFeatureRootIndex,
	getPathSegments,
} from '../util.js'

const DEFAULT_FOLDERS = [
	'api',
	'assets',
	'components',
	'forms',
	'hooks',
	'providers',
	'types',
	'utils',
]
const TEST_FOLDERS = ['__tests__', '__mocks__']

export const featureFolderStructureRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require feature folders to hold only known subfolders (`api`, `components`, `hooks`, …), no loose files.',
			url: 'https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md',
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
					folders: {
						type: 'array',
						items: { type: 'string', minLength: 1 },
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			fileInRoot:
				'`{{name}}` sits directly in `{{root}}/`, which holds only one folder per feature. Move it into a feature, or out to shared code.',
			fileInFeature:
				'`{{name}}` sits directly in the `{{feature}}` feature. Put it in one of its folders ({{folders}}) so every feature has the same shape.',
			unknownFolder:
				'`{{folder}}/` is not a feature folder. Use one of {{folders}} so every feature has the same shape.',
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const roots = options.roots ?? DEFAULT_FEATURE_ROOTS
		const folders = options.folders ?? DEFAULT_FOLDERS
		const allowed = new Set([...folders, ...TEST_FOLDERS])
		const folderList = folders.map((folder) => `\`${folder}\``).join(', ')

		/**
		 * Checks:
		 * features/users/components/users-list.tsx ✅
		 * features/users/api/get-users.ts ✅
		 * features/users/components/__tests__/users-list.test.tsx ✅
		 * features/index.ts ❌ no files in the root
		 * features/users/users.tsx ❌ no files in a feature
		 * features/users/helpers/format.ts ❌ not a feature folder
		 */
		return {
			Program(node) {
				const segments = getPathSegments(context)
				const rootIndex = findFeatureRootIndex(segments, roots)

				if (rootIndex === -1) {
					return
				}

				const root = segments[rootIndex]
				const [feature, folder, ...rest] = segments.slice(rootIndex + 1)
				const loc = { line: 1, column: 0 }

				if (folder === undefined) {
					context.report({
						node,
						loc,
						messageId: 'fileInRoot',
						data: { name: feature, root },
					})
					return
				}

				if (rest.length === 0) {
					context.report({
						node,
						loc,
						messageId: 'fileInFeature',
						data: { name: folder, feature, folders: folderList },
					})
					return
				}

				if (!allowed.has(folder)) {
					context.report({
						node,
						loc,
						messageId: 'unknownFolder',
						data: { folder, folders: folderList },
					})
				}
			},
		}
	},
}
