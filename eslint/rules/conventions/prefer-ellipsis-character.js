/** Elements whose text is code or literal input, where `...` is intended. */
const VERBATIM_ELEMENTS = new Set(['code', 'kbd', 'pre', 'samp'])

/** Attributes that hold human-readable text. */
const TEXT_ATTRIBUTES = new Set([
	'alt',
	'aria-description',
	'aria-label',
	'aria-placeholder',
	'aria-valuetext',
	'label',
	'placeholder',
	'title',
])

const THREE_DOTS = /(?<!\.)\.{3}(?!\.)/g

function isInsideVerbatimElement(node) {
	for (let current = node.parent; current; current = current.parent) {
		if (
			current.type === 'JSXElement' &&
			current.openingElement.name.type === 'JSXIdentifier' &&
			VERBATIM_ELEMENTS.has(current.openingElement.name.name)
		) {
			return true
		}
	}

	return false
}

function isTextAttributeValue(node) {
	const attribute =
		node.parent.type === 'JSXExpressionContainer'
			? node.parent.parent
			: node.parent

	return (
		attribute.type === 'JSXAttribute' &&
		attribute.name.type === 'JSXIdentifier' &&
		TEXT_ATTRIBUTES.has(attribute.name.name)
	)
}

function isJsxChildString(node) {
	return (
		node.parent.type === 'JSXExpressionContainer' &&
		(node.parent.parent.type === 'JSXElement' ||
			node.parent.parent.type === 'JSXFragment')
	)
}

export const preferEllipsisCharacterRule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',

		docs: {
			description:
				'Require the ellipsis character (…) instead of three dots in rendered text.',
			guidelineRuleId: 'web-interface-guidelines.typography',
		},

		schema: [],

		messages: {
			preferEllipsis:
				'Use the ellipsis character `…` instead of `...` (e.g. "Loading…", "Search…").',
		},
	},

	create(context) {
		const { sourceCode } = context

		function hasThreeDots(text) {
			THREE_DOTS.lastIndex = 0
			return THREE_DOTS.test(text)
		}

		/** Fixes only `targets`, so `${[...items]}` in a template stays intact. */
		function check(node, targets) {
			if (
				!targets.some((target) => hasThreeDots(sourceCode.getText(target))) ||
				isInsideVerbatimElement(node)
			) {
				return
			}

			context.report({
				node,
				messageId: 'preferEllipsis',
				fix: (fixer) =>
					targets
						.filter((target) => hasThreeDots(sourceCode.getText(target)))
						.map((target) =>
							fixer.replaceText(
								target,
								sourceCode.getText(target).replaceAll(THREE_DOTS, '…'),
							),
						),
			})
		}

		/**
		 * Checks:
		 * <p>Loading…</p> ✅
		 * <code>...args</code> ✅ (verbatim)
		 * <p>Loading...</p> ❌
		 * <input placeholder="Search..." /> ❌
		 * <span>{'Saving...'}</span> ❌
		 */
		return {
			JSXText(node) {
				check(node, [node])
			},

			Literal(node) {
				if (
					typeof node.value === 'string' &&
					(isTextAttributeValue(node) || isJsxChildString(node))
				) {
					check(node, [node])
				}
			},

			TemplateLiteral(node) {
				if (isJsxChildString(node) || isTextAttributeValue(node)) {
					check(node, node.quasis)
				}
			},
		}
	},
}
