type User = { id: string; name: string }

export function byId(users: User[]) {
	return Object.fromEntries(users.map((user) => [user.id, user]))
}

export function namesById(users: User[]) {
	return users.reduce<Record<string, string>>((names, user) => {
		names[user.id] = user.name
		return names
	}, {})
}
