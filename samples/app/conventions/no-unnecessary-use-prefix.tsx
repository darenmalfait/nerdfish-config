import * as React from 'react'

export function useDocumentTitle(title: string) {
	const [documentTitle, setDocumentTitle] = React.useState(title)

	return { documentTitle, setDocumentTitle }
}

export function justAUseLessFunction(title: string) {
	return title
}
