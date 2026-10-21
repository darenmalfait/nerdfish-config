import { getCallName } from '../util.js'

/** Same class-merging helpers Biome's useSortedClasses recognizes. */
const CLASS_FUNCTIONS = new Set(['clsx', 'cn', 'cva', 'cx', 'tv', 'tw'])
const CLASS_ATTRIBUTES = new Set(['class', 'className'])

function isClassAttribute(node) {
	return (
		node.type === 'JSXAttribute' &&
		node.name.type === 'JSXIdentifier' &&
		CLASS_ATTRIBUTES.has(node.name.name)
	)
}

function isClassFunctionCall(node) {
	return (
		node.type === 'CallExpression' &&
		CLASS_FUNCTIONS.has(getCallName(node.callee))
	)
}

function isClassRoot(node) {
	return isClassAttribute(node) || isClassFunctionCall(node)
}

/** True when `node` is nested in another class root (it is reported there). */
function hasClassRootAncestor(node) {
	for (let current = node.parent; current; current = current.parent) {
		if (isClassRoot(current)) {
			return true
		}
	}

	return false
}

function collectStrings(node, visitorKeys, strings) {
	if (node.type === 'Literal' && typeof node.value === 'string') {
		strings.push(node.value)
		return
	}

	if (node.type === 'TemplateElement') {
		strings.push(node.value.cooked ?? '')
		return
	}

	for (const key of visitorKeys[node.type] ?? []) {
		const value = node[key]
		const children = Array.isArray(value) ? value : [value]

		for (const child of children) {
			if (child?.type) {
				collectStrings(child, visitorKeys, strings)
			}
		}
	}
}

/**
 * Visit each outermost class root (`className={…}` or `cn(…)`) with every
 * class token found in its string literals, so checks can look across
 * conditional branches: `cn('outline-none', isActive && 'focus-visible:ring')`.
 */
export function createClassRootVisitor(context, check) {
	function visit(node) {
		if (hasClassRootAncestor(node)) {
			return
		}

		const strings = []
		const root = isClassAttribute(node) ? node.value : node

		if (root) {
			collectStrings(root, context.sourceCode.visitorKeys, strings)
		}

		const tokens = strings
			.flatMap((value) => value.split(/\s+/))
			.filter(Boolean)

		if (tokens.length > 0) {
			check(node, tokens)
		}
	}

	return {
		CallExpression(node) {
			if (isClassFunctionCall(node)) {
				visit(node)
			}
		},
		JSXAttribute(node) {
			if (isClassAttribute(node)) {
				visit(node)
			}
		},
	}
}

/** Utility without variants: `md:hover:outline-none` → `outline-none`. */
export function getUtility(token) {
	return token.slice(token.lastIndexOf(':') + 1).replace(/^!/, '')
}
