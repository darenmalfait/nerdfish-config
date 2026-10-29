import * as React from 'react'

if (typeof window !== 'undefined') {
	window.addEventListener('beforeunload', () => {})
}

function subscribeToResize(onResize: () => void) {
	window.addEventListener('resize', onResize)
	return () => window.removeEventListener('resize', onResize)
}

export function WindowWidth() {
	const width = React.useSyncExternalStore(
		subscribeToResize,
		() => window.innerWidth,
		() => 0,
	)

	return (
		<button type="button" onClick={() => window.print()}>
			{width}
		</button>
	)
}
