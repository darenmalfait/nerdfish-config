import importX from 'eslint-plugin-import-x'

const upstream = importX.rules['no-cycle']

const WHY =
	"In a cycle one module runs before the other finishes initializing, which shows up as `Cannot access 'X' before initialization` or a silent `undefined` depending on load order."

/** `import x from 'a'`, `export * from 'a'`, `import('a')`, `require('a')` → `a`. */
function getImportedSource(node) {
	return node.source?.value ?? node.arguments?.[0]?.value ?? 'this import'
}

/** `../utils/format:1=>../components/list:3` → `` `../utils/format` → `../components/list` ``. */
function toRoute(source) {
	return source
		.split('=>')
		.map((step) => `\`${step.replace(/:\d+$/, '')}\``)
		.join(' → ')
}

/**
 * import-x's no-cycle with messages that say how to break the cycle. Detection,
 * options and message ids are upstream's; only the text changes.
 */
export const noCycleRule = {
	...upstream,
	meta: {
		...upstream.meta,
		messages: {
			cycle: `\`{{imported}}\` imports this file back, so the two form a cycle. ${WHY} Move what both need into a third module they can both import (a \`utils/\`, \`types/\` or \`lib/\` file), make the import type-only if only types cross, or merge the two files if they are one concern.`,
			cycleSource: `\`{{imported}}\` leads back to this file through {{route}}, so these modules form a cycle. ${WHY} Find the import in that chain that points the wrong way, from lower-level code (utils, lib, types) up to code that uses it, and move what it needs into a module neither side imports. Make it type-only if only types cross.`,
		},
	},

	create(context) {
		const proxy = Object.create(context, {
			report: {
				value(descriptor) {
					context.report({
						...descriptor,
						data: {
							imported: getImportedSource(descriptor.node),
							route: descriptor.data?.source
								? toRoute(descriptor.data.source)
								: '',
						},
					})
				},
			},
		})

		return upstream.create(proxy)
	},
}
