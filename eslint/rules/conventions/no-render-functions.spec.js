import { ruleTester } from '../rule-tester.js'

import { noRenderFunctionsRule } from './no-render-functions.js'

ruleTester.run('no-render-functions', noRenderFunctionsRule, {
	valid: [
		`function Discussion({ comments }) {
	return <ul>{comments.map((comment) => <li key={comment.id}>{comment.body}</li>)}</ul>
}`,
		// Module-level helpers are not nested in a component
		`const renderComment = (comment) => <li>{comment.body}</li>
function Discussion({ comments }) {
	return <ul>{comments.map(renderComment)}</ul>
}`,
		// Render props: the receiving component decides the shape
		`function Names({ names }) {
	const renderItem = ({ item }) => <li>{item}</li>
	return <List items={names} renderItem={renderItem} />
}`,
		// Third-party APIs that take a function, even when it is also called
		`import { Controller } from 'react-hook-form'
function NameField({ control }) {
	const renderField = ({ field }) => <input {...field} />
	return <Controller control={control} name="name" render={renderField} />
}`,
		`function UsersTable() {
	const renderCell = (info) => <strong>{info.getValue()}</strong>
	const columns = [columnHelper.accessor('name', { cell: renderCell })]
	return <Table columns={columns} preview={renderCell(sample)} />
}`,
		`function SaveButton() {
	const renderToast = (t) => <span>Saved {t.id}</span>
	return <button onClick={() => toast.custom(renderToast)}>Save</button>
}`,
		`function Feed({ items }) {
	const renderItem = (index, item) => <Post post={item} />
	return <Virtuoso data={items} itemContent={renderItem} />
}`,
		// Not JSX
		`function Price({ amount }) {
	const format = (value) => value.toFixed(2)
	return <span>{format(amount)}</span>
}`,
		// Nested components are react/no-unstable-nested-components' job
		`function Discussion() {
	const Comment = () => <li />
	return <Comment />
}`,
		// Hooks are not components
		`function useRows(rows) {
	const renderRow = (row) => <tr key={row.id} />
	return rows.map(renderRow)
}`,
		// Inside a callback, not the component body
		`function Discussion({ groups }) {
	return groups.map((group) => {
		const renderTitle = () => <h2>{group.title}</h2>
		return renderTitle()
	})
}`,
	],
	invalid: [
		{
			code: `function Discussion({ comments }) {
	const renderComment = (comment) => <li key={comment.id}>{comment.body}</li>
	return <ul>{comments.map(renderComment)}</ul>
}`,
			errors: [
				{
					messageId: 'mappedRenderFunction',
					data: {
						name: 'renderComment',
						component: 'Discussion',
						suggested: 'Comment',
					},
				},
			],
		},
		{
			code: `function Discussion({ comments }) {
	function renderEmpty() {
		return <p>No comments</p>
	}
	return comments.length ? <ul /> : renderEmpty()
}`,
			errors: [
				{
					messageId: 'calledRenderFunction',
					data: {
						name: 'renderEmpty',
						component: 'Discussion',
						suggested: 'Empty',
					},
				},
			],
		},
		{
			code: `const Discussion = ({ isLoading }) => {
	const getSpinner = () => isLoading && <Spinner />
	return <div>{getSpinner()}</div>
}`,
			errors: [
				{
					messageId: 'calledRenderFunction',
					data: {
						name: 'getSpinner',
						component: 'Discussion',
						suggested: 'Spinner',
					},
				},
			],
		},
		{
			code: `const Discussion = memo(function Discussion({ comments }) {
	const renderComment = useCallback((comment) => <li>{comment.body}</li>, [])
	return <ul>{comments.flatMap(renderComment)}</ul>
})`,
			errors: [{ messageId: 'mappedRenderFunction' }],
		},
		{
			code: `export default function Discussion({ user }) {
	const renderHeader = () => {
		if (!user) {
			return null
		}
		return <h1>{user.name}</h1>
	}
	return <section>{renderHeader()}</section>
}`,
			errors: [{ messageId: 'calledRenderFunction' }],
		},
		{
			// Rendering into a third-party element is still our function to extract
			code: `import { Tooltip } from '@radix-ui/react-tooltip'
function Avatar({ user }) {
	const renderTooltip = () => <span>{user.name}</span>
	return <Tooltip content={renderTooltip()} />
}`,
			errors: [{ messageId: 'calledRenderFunction' }],
		},
	],
})
