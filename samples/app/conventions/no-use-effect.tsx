import { useEffect } from 'react'

function useMountEffect(effect: () => void) {
	useEffect(() => {
		effect()
		// Mount-only wrapper: `effect` is intentionally excluded from deps.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- useMountEffect
	}, [])
}

export function MountLogger() {
	useMountEffect(() => {
		console.info('mounted')
	})

	return null
}
