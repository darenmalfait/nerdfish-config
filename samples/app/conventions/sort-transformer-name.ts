type User = { name: string }

function byName(a: User, b: User) {
	return a.name.localeCompare(b.name)
}

export function sortedUsers(users: User[]) {
	return [...users].sort(byName)
}
