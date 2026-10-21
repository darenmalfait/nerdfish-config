export function SearchField({ isSaving }: { isSaving: boolean }) {
	return (
		<div>
			<input type="search" placeholder="Search…" aria-label="Search" />
			<p>{isSaving ? 'Saving…' : 'Saved'}</p>
			<code>fn(...args)</code>
		</div>
	)
}
