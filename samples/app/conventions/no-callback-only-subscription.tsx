declare function shareChat(
	chatId: string,
	options: { ref: string | null },
): void

export function ShareButton({ chatId }: { chatId: string }) {
	function handleShare() {
		const params = new URLSearchParams(window.location.search)
		shareChat(chatId, { ref: params.get('ref') })
	}

	return (
		<button type="button" onClick={handleShare}>
			Share
		</button>
	)
}
