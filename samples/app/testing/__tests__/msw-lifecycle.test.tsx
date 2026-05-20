import { describe, expect, it, screen, test } from './testing-runtime'

const server = {
	listen: () => {},
	resetHandlers: () => {},
	close: () => {},
	use: () => {},
}

test.beforeAll(() => {
	server.listen()
})

test.afterEach(() => {
	server.resetHandlers()
})

test.afterAll(() => {
	server.close()
})

describe('User Story: user can load profile data', () => {
	it('renders the user name', async () => {
		server.use()
		expect(
			await screen.findByRole('heading', { name: 'profile.display_name' }),
		).toBeInTheDocument()
	})
})
