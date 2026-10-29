declare function navigate(to: string | number): void
declare function save(): void
declare function Link(props: { href: string; children: string }): null

export function Toolbar() {
	function handleSave() {
		save()
		navigate('/done')
	}

	return (
		<nav>
			<Link href="/settings">Settings</Link>
			<button type="button" onClick={handleSave}>
				Save
			</button>
			<button type="button" onClick={() => navigate(-1)}>
				Back
			</button>
		</nav>
	)
}
