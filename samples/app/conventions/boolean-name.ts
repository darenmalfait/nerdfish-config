export function canSubmit(email: string, acceptedTerms: boolean) {
	const isValidEmail = email.includes('@')
	const hasAcceptedTerms = acceptedTerms

	return isValidEmail && hasAcceptedTerms
}
