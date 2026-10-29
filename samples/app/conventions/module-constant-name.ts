declare function cva(base: string): () => string

const EMPTY_RANGE = { start: '', end: '' }
const STORAGE_KEY = 'theme'
const COLOR_SCHEMES = new Set(['light', 'dark'])
const BARS = [{ className: 'top-0' }, { className: 'top-1/2' }] as const

// Exported names are public API or framework-required (`metadata`, `runtime`).
export const runtime = 'edge'

const buttonVariants = cva('inline-flex')
const api = { get: () => EMPTY_RANGE }

export function getDefaults() {
	return {
		range: EMPTY_RANGE,
		key: STORAGE_KEY,
		schemes: COLOR_SCHEMES,
		bars: BARS,
		button: buttonVariants(),
		api,
	}
}

declare const env: { API_URL?: string }

// SCREAMING_SNAKE_CASE is reserved for module-level constants: locals are camelCase,
// unless destructured from a source that uses that name.
export function getPagination(itemCount: number) {
	const { API_URL } = env
	const pageSize = itemCount > 50 ? 20 : 10

	return { url: API_URL, pageSize }
}
