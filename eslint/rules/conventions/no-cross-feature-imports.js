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

const DEFAULT_APP = ['app', 'routes']

/** An import as path segments: relative ones resolved from the file, aliases as written. */
function getImportSegments(source, fileSegments) {
	if (source.startsWith('.')) {
		return path.posix.join(...fileSegments.slice(0, -1), source).split('/')
	}

	if (LOCAL_IMPORT_SOURCE.test(source)) {
		return source.split('/')
	}

	return null
}

/** The feature an import points at, e.g. `@/features/users/api` → `{ base: '@', name: 'users', folder: 'api' }`. */
function getImportedFeature(importSegments, roots) {
	const rootIndex = findFeatureRootIndex(importSegments, roots)

	if (rootIndex === -1) {
		return null
	}

	return {
		base: importSegments.slice(0, rootIndex).join('/'),
		name: importSegments[rootIndex + 1],
		folder: importSegments[rootIndex + 2],
	}
}

/**
 * The app-layer folder an import points at, e.g. `app` for `@/app/provider`.
 * Only a folder next to the feature root counts: in Remix, `app/` is the root
 * that holds `features/` itself, and `app/routes/` is the app layer.
 */
function getImportedAppFolder(importSegments, isRelative, base, appFolders) {
	if (!isRelative) {
		return appFolders.includes(importSegments[1]) ? importSegments[1] : null
	}

	const baseLength = base ? base.split('/').length : 0
	const folder = importSegments[baseLength]
	const isNextToFeatureRoot =
		importSegments.slice(0, baseLength).join('/') === base

	return isNextToFeatureRoot && appFolders.includes(folder) ? folder : null
}

/** `import type { User }` or `import { type User }`: only the shape crosses over. */
function isTypeOnly(node) {
	const kind = node.importKind ?? node.exportKind

	if (kind === 'type') {
		return true
	}

	const specifiers = node.specifiers ?? []

	return (
		specifiers.length > 0 &&
		specifiers.every(
			(specifier) => (specifier.importKind ?? specifier.exportKind) === 'type',
		)
	)
}

/** Each kind of import has its own way out, so the message names the one that fits. */
function getCrossFeatureMessageId(target, isType) {
	if (isType || target.folder === 'types') {
		return 'crossFeatureTypeImport'
	}

	if (target.folder === 'components') {
		return 'crossFeatureComponentImport'
	}

	return 'crossFeatureImport'
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
				'Keep imports flowing shared → features → app: no imports between features, and none from shared code into a feature or from either into the app layer.',
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
					app: {
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
				'The `{{feature}}` feature imports from the `{{target}}` feature. Keep features independent so each can change or go away on its own. Compose them one level up instead: call `{{target}}` in the route or page and pass the result to `{{feature}}` as props, typed with only the fields `{{feature}}` reads. If many features need it, move it out of `{{target}}` into shared code (`lib/`, `hooks/`, `utils/`). If `{{feature}}` needs the data in its own shape, give it its own `api/` call.',
			crossFeatureTypeImport:
				'The `{{feature}}` feature imports types from the `{{target}}` feature. Declare the fields `{{feature}}` reads in its own props or `types/`: structural typing still accepts `{{target}}` data passed in from the route or page. If it is a domain model many features share, move it to the shared `types/` folder.',
			crossFeatureComponentImport:
				'The `{{feature}}` feature renders a component from the `{{target}}` feature. Give `{{feature}}` a slot (`children` or an element prop) and let the route or page pass the `{{target}}` component in. If many features render it, move it to the shared `components/` folder.',
			sharedImportsFeature:
				'Shared code in `{{folder}}/` imports from the `{{target}}` feature, so everything using it now depends on that feature. Take what it needs as props or `children` and let the route or page pass it in, or move the code it needs out of the feature into shared code.',
			featureImportsApp:
				'The `{{feature}}` feature imports from `{{target}}/`, the app layer that composes features. Imports flow one way, shared → features → app, so the app can wire features together without them knowing about it. Take what it needs as props from the route or page, or move the code it needs (config, providers, helpers) into shared code.',
			sharedImportsApp:
				'Shared code in `{{folder}}/` imports from `{{target}}/`, the app layer that composes features. Imports flow one way, shared → features → app, so everything using this code now depends on the whole app. Take what it needs as props or `children`, or move the code it needs out of `{{target}}/` into shared code.',
		},
	},

	create(context) {
		const options = context.options[0] || {}
		const roots = options.roots ?? DEFAULT_FEATURE_ROOTS
		const shared = options.shared ?? DEFAULT_SHARED
		const appFolders = options.app ?? DEFAULT_APP
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
		 * import { useUser } from '@/features/users/api/get-user' ❌ pass the data in from the route
		 * import { useUser } from '../../users/api/get-user' ❌
		 * import type { User } from '@/features/users/types' ❌ declare the fields it reads
		 * import { UserCard } from '@/features/users/components/user-card' ❌ take it as a slot
		 * import { AppProvider } from '@/app/provider' ❌ app layer
		 *
		 * From src/components/layouts/dashboard-layout.tsx:
		 * import { useUser } from '@/features/users/api/get-user' ❌
		 * import { paths } from '@/app/routes/paths' ❌
		 */
		function check(sourceNode, isType = false) {
			const source = resolveStaticStringValue(sourceNode)

			if (source === null || (!feature && !sharedBase)) {
				return
			}

			const importSegments = getImportSegments(source, segments)

			if (!importSegments) {
				return
			}

			const isRelative = source.startsWith('.')
			const base = feature ? featureBase : sharedBase.base
			const target = getImportedFeature(importSegments, roots)

			if (target) {
				// A relative path into some other folder's features is not this tree.
				if (target.name === feature || (isRelative && target.base !== base)) {
					return
				}

				context.report(
					feature
						? {
								node: sourceNode,
								messageId: getCrossFeatureMessageId(target, isType),
								data: { feature, target: target.name },
							}
						: {
								node: sourceNode,
								messageId: 'sharedImportsFeature',
								data: { folder: sharedBase.folder, target: target.name },
							},
				)
				return
			}

			const appFolder = getImportedAppFolder(
				importSegments,
				isRelative,
				base,
				appFolders,
			)

			if (!appFolder) {
				return
			}

			context.report({
				node: sourceNode,
				messageId: feature ? 'featureImportsApp' : 'sharedImportsApp',
				data: { feature, folder: sharedBase?.folder, target: appFolder },
			})
		}

		return {
			ImportDeclaration(node) {
				check(node.source, isTypeOnly(node))
			},
			ExportAllDeclaration(node) {
				check(node.source, isTypeOnly(node))
			},
			ExportNamedDeclaration(node) {
				if (node.source) {
					check(node.source, isTypeOnly(node))
				}
			},
			ImportExpression(node) {
				check(node.source)
			},
		}
	},
}
