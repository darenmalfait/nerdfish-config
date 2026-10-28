declare function validate(form: FormData): void
declare function submit(form: FormData): void

export function save(form: FormData, isValid: boolean) {
	if (!isValid) {
		return
	}

	validate(form)
	submit(form)
}
