export type User = { name: string }

export async function getUser(id: string): Promise<User> {
	const response = await fetch(`/api/users/${id}`)
	return response.json() as Promise<User>
}
