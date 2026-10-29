import {
	callsPreventDefault,
	getMemberPropertyName,
	resolveHandler,
	resolveStaticStringArg,
} from '../util.js'

const CONTEXT_MENU_PROPS = new Set(['onContextMenu', 'onContextMenuCapture'])

export const noContextMenuRule = {
	meta: {
		type: 'problem',

		docs: {
			description:
				'Disallow replacing the browser context menu (`contextmenu` handlers that call preventDefault()).',
			url: 'https://github.com/Shopify/web-configs/blob/main/packages/eslint-plugin/docs/rules/no-context-menu.md',
		},

		schema: [],

		messages: {
			noContextMenu:
				'Replacing the browser context menu takes away copy, open-in-new-tab, spellcheck and assistive-tech shortcuts users rely on. Keep the native menu; if the app truly needs its own (a canvas editor, say), use an accessible context-menu component and disable this rule there with a reason.',
		},
	},

	create(context) {
		const { sourceCode } = context

		function check(node, handlerExpression) {
			const handler = resolveHandler(sourceCode, handlerExpression)

			if (handler && callsPreventDefault(handler, sourceCode.visitorKeys)) {
				context.report({ node, messageId: 'noContextMenu' })
			}
		}

		/**
		 * Checks:
		 * <div onContextMenu={() => track('right-click')} /> ✅ (native menu still opens)
		 * <div onContextMenu={(event) => event.preventDefault()} /> ❌
		 * <div onContextMenu={handleContextMenu} /> where handleContextMenu calls preventDefault ❌
		 * element.addEventListener('contextmenu', (event) => event.preventDefault()) ❌
		 */
		return {
			JSXAttribute(node) {
				if (
					node.name.type === 'JSXIdentifier' &&
					CONTEXT_MENU_PROPS.has(node.name.name) &&
					node.value?.type === 'JSXExpressionContainer'
				) {
					check(node, node.value.expression)
				}
			},
			CallExpression(node) {
				if (
					getMemberPropertyName(node.callee) === 'addEventListener' &&
					resolveStaticStringArg(node)?.value === 'contextmenu'
				) {
					check(node, node.arguments[1])
				}
			},
		}
	},
}
