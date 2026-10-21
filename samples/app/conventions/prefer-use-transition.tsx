import { useTransition } from 'react'

declare function saveDraft(): Promise<void>

export function SaveButton() {
	const [isPending, startTransition] = useTransition()

	function handleSave() {
		startTransition(async () => {
			await saveDraft()
		})
	}

	return (
		<button type="button" disabled={isPending} onClick={handleSave}>
			{isPending ? 'Saving…' : 'Save'}
		</button>
	)
}
