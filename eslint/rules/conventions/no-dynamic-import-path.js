import { resolveStaticStringValue } from '../util.js'

export const noDynamicImportPathRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description: 'Require import() to receive a static string path.',
			guidelineRuleId: 'bundle-analyzable-paths',
		},

		schema: [],

		messages: {
			noDynamicImportPath:
				"A computed `import()` path hides the module from the bundler, which then bundles every file that could match (or cannot analyze it at all). Map each option to its own static import instead: `{ home: () => import('./pages/home') }`.",
		},
	},

	create(context) {
		/**
		 * Checks:
		 * import('./pages/home') ✅
		 * PAGE_MODULES[name]() with { home: () => import('./pages/home') } ✅
		 * import(PAGE_MODULES[name]) ❌
		 * import(`./locales/${locale}.json`) ❌
		 */
		return {
			ImportExpression(node) {
				if (resolveStaticStringValue(node.source) !== null) {
					return
				}

				context.report({
					node: node.source,
					messageId: 'noDynamicImportPath',
				})
			},
		}
	},
}
