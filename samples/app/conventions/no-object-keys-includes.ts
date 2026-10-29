const LABELS = { draft: 'Draft', published: 'Published' }

export function hasLabel(status: string) {
	return Object.hasOwn(LABELS, status)
}
