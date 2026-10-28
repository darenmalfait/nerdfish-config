import { useState } from 'react'

export function useToggle(initial = false) {
	const [isOn, setIsOn] = useState(initial)

	return [isOn, setIsOn] as const
}

export function useCounter() {
	const [count, setCount] = useState(0)

	return {
		count,
		increment: () => setCount((current) => current + 1),
		reset: () => setCount(0),
	}
}
