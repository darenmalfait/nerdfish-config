import {
	callsPreventDefault,
	getMemberPropertyName,
	resolveHandler,
	resolveStaticStringArg,
} from '../util.js'

const PASTE_PROPS = new Set(['onPaste', 'onPasteCapture'])

export const noPasteBlockingRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Disallow `paste` handlers that call preventDefault(), via JSX props or addEventListener.',
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

		function check(node, handlerExpression) {
			const handler = resolveHandler(sourceCode, handlerExpression)

			if (handler && callsPreventDefault(handler, sourceCode.visitorKeys)) {
				context.report({ node, messageId: 'noPasteBlocking' })
			}
		}

		/**
		 * Checks:
		 * <input onPaste={handlePaste} /> where handlePaste only reads ✅
		 * <input onPaste={(event) => event.preventDefault()} /> ❌
		 * <input onPaste={handlePaste} /> where handlePaste calls preventDefault ❌
		 * input.addEventListener('paste', (event) => event.preventDefault()) ❌
		 */
		return {
			JSXAttribute(node) {
				if (
					node.name.type === 'JSXIdentifier' &&
					PASTE_PROPS.has(node.name.name) &&
					node.value?.type === 'JSXExpressionContainer'
				) {
					check(node, node.value.expression)
				}
			},
			CallExpression(node) {
				if (
					getMemberPropertyName(node.callee) === 'addEventListener' &&
					resolveStaticStringArg(node)?.value === 'paste'
				) {
					check(node, node.arguments[1])
				}
			},
		}
	},
}
