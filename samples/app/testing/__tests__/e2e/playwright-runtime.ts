/** Stub Playwright test APIs for lint fixtures — not executed, only parsed by ESLint. */

export interface Locator {
	click(): Promise<void>
	fill(value: string): Promise<void>
}

export interface Page {
	goto(url: string): Promise<void>
	getByRole(role: string, options?: { name?: string }): Locator
}

export interface PlaywrightTestArgs {
	page: Page
}

function createExpectMatchers() {
	return {
		async toBeVisible() {},
		async toBeHidden() {},
	}
}

export function expect(_locator: unknown) {
	return createExpectMatchers()
}

const noop = (..._args: unknown[]) => {}

function defineSuite(_name: string, fn: () => void) {
	fn()
}

type PlaywrightTestFn = (args: PlaywrightTestArgs) => void | Promise<void>

export const test = Object.assign(
	(_name: string, _fn: PlaywrightTestFn) => {},
	{
		describe: defineSuite,
		beforeAll: noop,
		afterEach: noop,
		afterAll: noop,
		beforeEach: noop,
	},
)
