import type * as React from 'react'

export function CodeField() {
	function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
		console.info(event.clipboardData.getData('text').trim())
	}

	return <input name="code" aria-label="Code" onPaste={handlePaste} />
}
