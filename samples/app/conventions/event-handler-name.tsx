import * as React from 'react'

export function LoginForm() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
	}

	function handleClick() {}

	const handleMemoizedClick = React.useCallback(() => {}, [])

	return (
		<form onSubmit={handleSubmit}>
			<button type="button" onClick={handleClick}>
				Submit
			</button>
			<button type="button" onClick={handleMemoizedClick}>
				Memoized
			</button>
		</form>
	)
}

type IconButtonProps = {
	onClick: React.MouseEventHandler<HTMLButtonElement>
}

export function IconButton({ onClick }: IconButtonProps) {
	return (
		<button type="button" onClick={onClick}>
			Icon
		</button>
	)
}
