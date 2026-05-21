import {
	beforeEach,
	describe,
	expect,
	it,
	render,
	screen,
	test,
} from './testing-runtime'

/** MSW-shaped stubs — file is parsed by ESLint only, not executed. */
const http = {
	get: (_path: string, _resolver: () => unknown) => ({}),
}

const server = {
	listen: () => {},
	resetHandlers: () => {},
	close: () => {},
	use: (..._handlers: unknown[]) => {},
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
	describe('Given the profile is rendered', () => {
		beforeEach(() => {
			server.use(
				http.get('/api/profile', () => ({
					displayName: 'profile.display_name',
				})),
			)

			render(<Profile />)
		})

		it('renders the user name from the mocked profile endpoint', async () => {
			expect(
				await screen.findByRole('heading', { name: 'profile.display_name' }),
			).toBeInTheDocument()
		})
	})
})

function Profile() {
	return <div>profile.display_name</div>
}
