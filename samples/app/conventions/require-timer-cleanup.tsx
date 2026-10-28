import { useEffect, useState } from 'react'

export function Toast({ message }: { message: string }) {
	const [isVisible, setIsVisible] = useState(true)

	useEffect(() => {
		const id = setTimeout(() => setIsVisible(false), 3000)

		return () => clearTimeout(id)
	}, [message])

	return isVisible ? <p role="status">{message}</p> : null
}
