type User = { id: string; name: string; tags: string[] }

function toUserId(user: User) {
	return user.id
}

function toDisplayName(user: User) {
	return user.name
}

function toTags(user: User) {
	return user.tags
}

export function userIds(users: User[]) {
	return users.map(toUserId)
}

export function displayNames(users: User[]) {
	return users.map(toDisplayName)
}

export function allTags(users: User[]) {
	return users.flatMap(toTags)
}

export function displayNamesFrom(users: Iterable<User>) {
	return Array.from(users, toDisplayName)
}
