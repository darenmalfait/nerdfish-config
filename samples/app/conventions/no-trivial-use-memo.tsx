import { useMemo } from 'react'

type User = { name: string; isActive: boolean }

export function ActiveUsers({
	users,
	isLoading,
}: {
	users: User[]
	isLoading: boolean
}) {
	const activeUsers = useMemo(
		() => users.filter((user) => user.isActive),
		[users],
	)
	const isEmpty = !isLoading && activeUsers.length === 0

	return isEmpty ? <p>No active users</p> : <p>{activeUsers.length} active</p>
}
