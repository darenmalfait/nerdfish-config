import { useState } from 'react'

export function Counter() {
	const [count, setCount] = useState(0)
	const increment = () => setCount((c) => c + 1)
	return (
		<button type='button' onClick={increment}>
			{count}
		</button>
	)
}
