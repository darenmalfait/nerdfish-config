type User = { name: string; isActive: boolean }

export function activeNames(users: User[]) {
	return users.flatMap((user) => (user.isActive ? [user.name] : []))
}
