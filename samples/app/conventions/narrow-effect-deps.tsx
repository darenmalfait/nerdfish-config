import { useEffect } from 'react'

type User = { id: string; name: string }

declare function trackView(userId: string): void

export function Profile({ user }: { user: User }) {
	useEffect(() => {
		trackView(user.id)
	}, [user.id])

	return <h1>{user.name}</h1>
}
