type User = { id: string; name: string }

function toUserId(user: User) {
	return user.id
}

function toDisplayName(user: User) {
	return user.name
}

export function userIds(users: User[]) {
	return users.map(toUserId)
}

export function displayNames(users: User[]) {
	return users.map(toDisplayName)
}
