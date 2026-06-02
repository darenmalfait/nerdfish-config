/** Stub test/RTL APIs for lint fixtures — not executed, only parsed by ESLint. */

const element = () => ({}) as HTMLElement

function createMatchers() {
	const matchers = {
		toBe(_expected: unknown) {},
		toBeInTheDocument() {},
		toBeNull() {},
		toHaveClass(..._classNames: string[]) {},
		not: {} as {
			toBe(_expected: unknown): void
			toBeInTheDocument(): void
			toBeNull(): void
			toHaveClass(..._classNames: string[]): void
		},
	}
	matchers.not = matchers
	return matchers
}

export function expect(_actual: unknown) {
	return createMatchers()
}

export function render(_ui: unknown) {
	return { container: element() }
}

export const screen = {
	getByRole: (_role: string, _options?: { name?: string }) => element(),
	getByTestId: (_testId: string) => element(),
	getByText: (_text: string | RegExp) => element(),
	findByRole: async (_role: string, _options?: { name?: string }) => element(),
	findByText: async (_text: string | RegExp) => element(),
}

export function within(_element: HTMLElement) {
	return screen
}

export async function waitFor<T>(callback: () => T | Promise<T>): Promise<T> {
	return callback()
}

const noop = (..._args: unknown[]) => {}

function defineSuite(_name: string, fn: () => void) {
	fn()
}

export const test = Object.assign(
	(_name: string, _fn: () => void | Promise<void>) => {},
	{
		describe: defineSuite,
		beforeAll: noop,
		afterEach: noop,
		afterAll: noop,
		beforeEach: noop,
	},
)

export const describe = defineSuite
export const it = (_name: string, _fn: () => void | Promise<void>) => {}
export const beforeAll = test.beforeAll
export const afterEach = test.afterEach
export const afterAll = test.afterAll
export const beforeEach = test.beforeEach

export const jest = {
	mock: noop,
	requireActual: <T extends object = Record<string, unknown>>(
		_moduleName: string,
	) => ({}) as T,
}
