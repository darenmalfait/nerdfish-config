const API_URL = 'https://example.com/api'

type ApiClientOptions = {
	baseURL: string
}

export function createApiClient({ baseURL }: ApiClientOptions) {
	return {
		getUserId: async (token: string) => {
			const response = await fetch(`${baseURL}/me`, {
				headers: { authorization: token },
			})
			const { userID } = (await response.json()) as { userID: string }

			return userID
		},
	}
}

export const defaultClient = createApiClient({ baseURL: API_URL })
