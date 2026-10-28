import { useEffect, useMemo } from 'react'

type User = { id: string; name: string }

declare function trackView(userId: string): void

export function Profile({ user }: { user: User }) {
	useEffect(() => {
		trackView(user.id)
	}, [user.id])

	const greeting = useMemo(() => `Hello ${user.name}`.trim(), [user.name])

	return <h1>{greeting}</h1>
}
