import * as React from 'react'

type UserRowProps = { user: { id: string; name: string } }

function UserRow({ user }: UserRowProps) {
	return <li>{user.name}</li>
}

export const MemoizedUserRow = React.memo(
	UserRow,
	(prev, next) =>
		prev.user.id === next.user.id && prev.user.name === next.user.name,
)
