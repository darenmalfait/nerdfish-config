import * as React from 'react'

export function useDocumentTitle(title: string) {
	const [documentTitle, setDocumentTitle] = React.useState(title)

	React.useEffect(() => {
		document.title = documentTitle
	}, [documentTitle])

	return setDocumentTitle
}

export function justAUseLessFunction(title: string) {
	return title
}
