import * as React from 'react'

export function LoginForm() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
	}

	function handleClick() {}

	return (
		<form onSubmit={handleSubmit}>
			<button type="button" onClick={handleClick}>
				Submit
			</button>
		</form>
	)
}
