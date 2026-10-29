import { callsPreventDefault, resolveHandler } from '../util.js'

export const noPasteBlockingRule = {
	meta: {
		type: 'problem',

		docs: {
			description: 'Disallow onPaste handlers that call preventDefault().',
			guidelineRuleId: 'web-interface-guidelines.forms',
		},

		schema: [],

		messages: {
			noPasteBlocking:
				'Blocking paste breaks password managers and assistive tech, and frustrates users. Let the paste through and validate the value instead.',
		},
	},

	create(context) {
		const { sourceCode } = context

		/**
		 * Checks:
		 * <input onPaste={handlePaste} /> where handlePaste only reads ✅
		 * <input onPaste={(event) => event.preventDefault()} /> ❌
		 * <input onPaste={handlePaste} /> where handlePaste calls preventDefault ❌
		 */
		return {
			JSXAttribute(node) {
				if (
					node.name.type !== 'JSXIdentifier' ||
					node.name.name !== 'onPaste' ||
					node.value?.type !== 'JSXExpressionContainer'
				) {
					return
				}

				const handler = resolveHandler(sourceCode, node.value.expression)

				if (handler && callsPreventDefault(handler, sourceCode.visitorKeys)) {
					context.report({ node, messageId: 'noPasteBlocking' })
				}
			},
		}
	},
}
