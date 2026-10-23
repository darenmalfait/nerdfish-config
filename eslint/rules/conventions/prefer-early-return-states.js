import { isFunctionNode, isJsxExpression } from '../util.js'

/** `cond ? <A /> : …` or `cond && <A />`: a branch that picks what to render. */
function isJsxConditional(node) {
	if (node.type === 'ConditionalExpression') {
		return isJsxExpression(node)
	}

	return (
		node.type === 'LogicalExpression' &&
		node.operator === '&&' &&
		isJsxExpression(node.right)
	)
}

/** `a ? <A /> : b ? <B /> : <C />` → 2 tests. */
function countChainedTests(node) {
	return node.type === 'ConditionalExpression'
		? 1 + countChainedTests(node.alternate)
		: 0
}

export const preferEarlyReturnStatesRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow rendering mutually exclusive states through several JSX conditionals; return early once per state instead.',
			url: 'https://tkdodo.eu/blog/component-composition-is-great-btw',
		},

		schema: [],

		messages: {
			sharedStateConditionals:
				'{{names}} decide several branches of this JSX, so readers have to evaluate every condition to know what each state renders. Return early once per state (e.g. `if (isPending) return <Layout><Skeleton /></Layout>`) and render only the final state here. Repeating the shared layout in each branch is fine.',
			chainedConditional:
				'This ternary chain renders {{count}} different states inline. Return early once per state (e.g. `if (isPending) return <Layout><Skeleton /></Layout>`) instead. Repeating the shared layout in each branch is fine.',
		},
	},

	create(context) {
		const { sourceCode } = context

		/** Root identifiers a test reads: `!data && !isPending` → data, isPending; `data?.assignee` → data. */
		function getTestNames(test) {
			const names = new Set()

			function visit(node) {
				if (!node?.type || isFunctionNode(node)) {
					return
				}

				if (node.type === 'Identifier' && node.name !== 'undefined') {
					names.add(node.name)
					return
				}

				if (node.type === 'MemberExpression') {
					visit(node.object)
					if (node.computed) {
						visit(node.property)
					}
					return
				}

				for (const key of sourceCode.visitorKeys[node.type] ?? []) {
					const child = node[key]
					for (const item of Array.isArray(child) ? child : [child]) {
						visit(item)
					}
				}
			}

			visit(test)
			return names
		}

		/** Conditionals in one rendered tree; callbacks like `.map(item => …)` render per item, so they are skipped. */
		function collectConditionals(root) {
			const conditionals = []

			function visit(node) {
				if (!node?.type || isFunctionNode(node)) {
					return
				}

				if (isJsxConditional(node)) {
					conditionals.push(node)

					const branches =
						node.type === 'ConditionalExpression'
							? [node.consequent, node.alternate]
							: [node.right]

					// a chained `: b ? …` is part of this conditional, not a sibling
					for (const branch of branches) {
						if (branch.type === 'ConditionalExpression') {
							visit(branch.consequent)
							visit(branch.alternate)
						} else {
							visit(branch)
						}
					}
					return
				}

				for (const key of sourceCode.visitorKeys[node.type] ?? []) {
					const child = node[key]
					for (const item of Array.isArray(child) ? child : [child]) {
						visit(item)
					}
				}
			}

			visit(root)
			return conditionals
		}

		function checkRendered(root) {
			if (!isJsxExpression(root)) {
				return
			}

			const conditionals = collectConditionals(root)
			const seenNames = new Set()

			for (const conditional of conditionals) {
				const chainedTests = countChainedTests(conditional)

				if (chainedTests >= 2) {
					context.report({
						node: conditional,
						messageId: 'chainedConditional',
						data: {
							count: chainedTests + 1,
						},
					})
					return
				}

				const testNames = getTestNames(
					conditional.type === 'ConditionalExpression'
						? conditional.test
						: conditional.left,
				)
				const sharedNames = [...testNames].filter((name) => seenNames.has(name))

				if (sharedNames.length > 0) {
					context.report({
						node: conditional,
						messageId: 'sharedStateConditionals',
						data: {
							names: sharedNames.map((name) => `\`${name}\``).join(', '),
						},
					})
					return
				}

				for (const name of testNames) {
					seenNames.add(name)
				}
			}
		}

		/**
		 * Checks:
		 * if (isPending) return <Layout><Skeleton /></Layout>
		 * return <Layout>{data.assignee ? <UserInfo /> : null}{…}</Layout> ✅ (one optional part)
		 * <Layout>{isPending ? <Skeleton /> : null}{data ? <List /> : null}{!data && !isPending ? <Empty /> : null}</Layout> ❌
		 * {isPending ? <Skeleton /> : !data ? <Empty /> : <List />} ❌
		 */
		return {
			ReturnStatement(node) {
				checkRendered(node.argument)
			},
			ArrowFunctionExpression(node) {
				if (node.body.type !== 'BlockStatement') {
					checkRendered(node.body)
				}
			},
		}
	},
}
