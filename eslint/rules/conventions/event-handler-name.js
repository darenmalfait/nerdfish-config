export const eventHandlerNameRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Require local DOM event handler identifiers to start with handle.',
			guidelineRuleId: 'event-handler-prefix',
		},

		schema: [],

		messages: {
			eventHandlerPrefix:
				'Use a handle* name for local DOM event handlers passed to {{attributeName}}.',
		},
	},

	create(context) {
		/**
		 * React DOM event props:
		 * onClick
		 * onChange
		 * onSubmit
		 * etc.
		 */
		function isDomEventHandlerAttribute(attributeName) {
			return /^on[A-Z]/.test(attributeName)
		}

		/**
		 * Checks:
		 * <button onClick={handleClick} /> ✅
		 * <button onClick={onClick} /> ❌
		 * <button onClick={submitForm} /> ❌
		 */
		return {
			JSXAttribute(node) {
				// Ensure attribute has a name
				if (!node.name || node.name.type !== 'JSXIdentifier') {
					return
				}

				const attributeName = node.name.name

				// Only care about React event handlers
				if (!isDomEventHandlerAttribute(attributeName)) {
					return
				}

				// Ensure:
				// onClick={something}
				if (!node.value || node.value.type !== 'JSXExpressionContainer') {
					return
				}

				const expression = node.value.expression

				// Ignore inline callbacks:
				// onClick={() => {}}
				// onClick={function() {}}
				if (
					expression.type === 'ArrowFunctionExpression' ||
					expression.type === 'FunctionExpression'
				) {
					return
				}

				// Only validate identifiers:
				// onClick={handleClick}
				if (expression.type !== 'Identifier') {
					return
				}

				const handlerName = expression.name

				if (!handlerName.startsWith('handle')) {
					context.report({
						node: expression,
						messageId: 'eventHandlerPrefix',
						data: {
							attributeName,
						},
					})
				}
			},
		}
	},
}
