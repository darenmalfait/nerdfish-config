type User = { name: string }

function bySorted(a: User, b: User) {
	return a.name.localeCompare(b.name)
}

export function sortedUsers(users: User[]) {
	return users.toSorted(bySorted)
}
