import * as React from 'react'

export function useDocumentTitle(title: string) {
	const [documentTitle, setDocumentTitle] = React.useState(title)

	return { documentTitle, setDocumentTitle }
}

const TitleContext = React.createContext('')

export function useTitle() {
	return React.use(TitleContext)
}

export function justAUseLessFunction(title: string) {
	return title
}
