declare function track(event: string): void

export function Canvas() {
	return (
		<div onContextMenu={() => track('context-menu')}>
			Right-click still opens the browser menu
		</div>
	)
}
