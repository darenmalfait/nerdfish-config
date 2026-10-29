// Guideline registry id: testing.spec.no-snapshot-assertions
import { getMemberPropertyName } from '../../util.js'

const SNAPSHOT_MATCHERS = new Set([
	'toMatchFileSnapshot',
	'toMatchInlineSnapshot',
	'toMatchSnapshot',
	'toThrowErrorMatchingInlineSnapshot',
	'toThrowErrorMatchingSnapshot',
])

/** `expect(…)` at the root of `expect(x).not.toMatchSnapshot()`, or null. */
function getExpectCall(matcherCall) {
	let node = matcherCall.callee.object

	while (node?.type === 'MemberExpression') {
		node = node.object
	}

	return node?.type === 'CallExpression' &&
		node.callee.type === 'Identifier' &&
		node.callee.name === 'expect'
		? node
		: null
}

/** Playwright visual regression: `expect(await page.screenshot()).toMatchSnapshot()`. */
function isScreenshot(subject) {
	const call = subject?.type === 'AwaitExpression' ? subject.argument : subject

	return (
		call?.type === 'CallExpression' &&
		getMemberPropertyName(call.callee) === 'screenshot'
	)
}

export const noSnapshotAssertionsRule = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow snapshot assertions; assert the behaviour the user sees instead.',
			guidelineRuleId: 'testing.spec.no-snapshot-assertions',
			url: 'https://github.com/Shopify/web-configs/blob/main/packages/eslint-plugin/docs/rules/jest-no-snapshots.md',
		},
		schema: [],
		messages: {
			noSnapshot:
				'`{{matcher}}` passes as long as the output does not change, not when it is correct, and a failing snapshot tends to get updated without review. Assert what matters instead: `expect(screen.getByRole(…)).toBeVisible()`, `toHaveTextContent(…)`, `toEqual(…)`.',
		},
	},
	create(context) {
		/**
		 * Checks:
		 * expect(screen.getByRole('alert')).toHaveTextContent('Saved') ✅
		 * expect(await page.screenshot()).toMatchSnapshot() ✅ (visual regression)
		 * expect(container).toMatchSnapshot() ❌
		 * expect(render(<Card />)).toMatchInlineSnapshot(`…`) ❌
		 * expect(() => parse('')).toThrowErrorMatchingSnapshot() ❌
		 */
		return {
			CallExpression(node) {
				const matcher = getMemberPropertyName(node.callee)

				if (!SNAPSHOT_MATCHERS.has(matcher)) {
					return
				}

				const expectCall = getExpectCall(node)

				if (!expectCall || isScreenshot(expectCall.arguments[0])) {
					return
				}

				context.report({
					node: node.callee.property,
					messageId: 'noSnapshot',
					data: { matcher },
				})
			},
		}
	},
}
