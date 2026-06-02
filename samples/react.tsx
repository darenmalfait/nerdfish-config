import * as React from 'react'

export function Counter() {
	const [count, setCount] = React.useState(0)

	const handleClick = () => setCount((c) => c + 1)
	return (
		<button type="button" onClick={handleClick}>
			{count}
		</button>
	)
}
