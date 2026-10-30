import fs from 'node:fs'
import path from 'node:path'

import {
	DEFAULT_FEATURE_ROOTS,
	findFeatureRootIndex,
	getPathSegments,
	LOCAL_IMPORT_SOURCE,
	resolveStaticStringValue,
} from '../util.js'

const DEFAULT_SHARED = [
	'components',
	'config',
	'hooks',
	'lib',
	'providers',
	'types',
	'utils',
]

/** The feature an import points at, e.g. `@/features/users/api` → `{ base: '@', name: 'users' }`. */
function getImportedFeature(source, fileSegments, roots) {
	let segments

	if (source.startsWith('.')) {
		segments = path.posix.join(...fileSegments.slice(0, -1), source).split('/')
	} else if (LOCAL_IMPORT_SOURCE.test(source)) {
		segments = source.split('/')
	} else {
		return null
	}

	const rootIndex = findFeatureRootIndex(segments, roots)

	if (rootIndex === -1) {
		return null
	}

	return {
		isRelative: source.startsWith('.'),
		base: segments.slice(0, rootIndex).join('/'),
		name: segments[rootIndex + 1],
	}
}

/**
 * The folder holding a shared folder that sits next to a feature root, e.g.
 * `src` for `src/components/button.tsx` when `src/features` exists. Checking
 * for the sibling keeps `routes/users/components` from counting as shared.
 */
function findSharedBase(context, segments, roots, shared) {
	for (let index = 0; index < segments.length - 1; index++) {
		if (!shared.includes(segments[index])) {
			continue
		}

		const base = segments.slice(0, index)
		const hasFeatureRoot = roots.some((root) =>
			fs.existsSync(path.join(context.cwd, ...base, root)),
		)

		if (hasFeatureRoot) {
			return { base: base.join('/'), folder: segments[index] }
		}
	}

	return null
}

export const noCrossFeatureImportsRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Disallow imports from one feature into another, and from shared code into a feature.',
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
					shared: {
						type: 'array',
						items: { type: 'string', minLength: 1 },
						uniqueItems: true,
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			crossFeatureImport:
				'The `{{feature}}` feature imports from the `{{target}}` feature. Keep features independent so each can change or go away on its own: compose them in a route or page, or move the shared code out of the feature.',
			sharedImportsFeature:
				'Shared code in `{{folder}}/` imports from the `{{target}}` feature, so everything using it now depends on that feature. Move what it needs into shared code, or pass it in from the route.',
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const roots = options.roots ?? DEFAULT_FEATURE_ROOTS
		const shared = options.shared ?? DEFAULT_SHARED
		const segments = getPathSegments(context)
		const rootIndex = findFeatureRootIndex(segments, roots)
		// A file directly in the root is feature-folder-structure's to report.
		const isInFeature = rootIndex !== -1 && rootIndex < segments.length - 2
		const feature = isInFeature ? segments[rootIndex + 1] : null
		const featureBase = segments.slice(0, rootIndex).join('/')
		const sharedBase =
			rootIndex === -1 ? findSharedBase(context, segments, roots, shared) : null

		/**
		 * Checks, from src/features/comments/components/comments.tsx:
		 * import { getComments } from '../api/get-comments' ✅
		 * import { Button } from '@/components/ui/button' ✅
		 * import { useUser } from '@/features/users/api/get-user' ❌
		 * import { useUser } from '../../users/api/get-user' ❌
		 *
		 * From src/components/layouts/dashboard-layout.tsx:
		 * import { useUser } from '@/features/users/api/get-user' ❌
		 */
		function check(sourceNode) {
			const source = resolveStaticStringValue(sourceNode)

			if (source === null || (!feature && !sharedBase)) {
				return
			}

			const target = getImportedFeature(source, segments, roots)

			if (!target) {
				return
			}

			if (feature) {
				// A relative path into some other folder's features is not this tree.
				if (
					target.name === feature ||
					(target.isRelative && target.base !== featureBase)
				) {
					return
				}

				context.report({
					node: sourceNode,
					messageId: 'crossFeatureImport',
					data: { feature, target: target.name },
				})
				return
			}

			if (target.isRelative && target.base !== sharedBase.base) {
				return
			}

			context.report({
				node: sourceNode,
				messageId: 'sharedImportsFeature',
				data: { folder: sharedBase.folder, target: target.name },
			})
		}

		return {
			ImportDeclaration(node) {
				check(node.source)
			},
			ExportAllDeclaration(node) {
				check(node.source)
			},
			ExportNamedDeclaration(node) {
				if (node.source) {
					check(node.source)
				}
			},
			ImportExpression(node) {
				check(node.source)
			},
		}
	},
}
