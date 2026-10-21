export function SignInFields() {
	return (
		<div>
			<input
				type="email"
				name="email"
				aria-label="Email"
				autoComplete="email"
			/>
			<input
				type="password"
				name="password"
				aria-label="Password"
				autoComplete="current-password"
			/>
		</div>
	)
}
