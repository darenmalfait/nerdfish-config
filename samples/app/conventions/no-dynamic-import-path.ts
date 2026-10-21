const PAGE_MODULES = {
	home: () => import('./map-transformer-name'),
	settings: () => import('./sort-transformer-name'),
} as const

export async function loadPage(page: keyof typeof PAGE_MODULES) {
	return PAGE_MODULES[page]()
}
