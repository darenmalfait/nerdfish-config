import { useEffect } from 'react'

export function TitleSyncEffect({ title }: { title: string }) {
	useEffect(() => {
		document.title = title
	}, [title])

	return null
}

export function Greeting({ name }: { name?: string }) {
	useEffect(() => {}, [])

	if (!name) {
		return null
	}

	return <p>Hello {name}</p>
}
