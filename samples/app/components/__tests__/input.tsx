interface MockInputProps {
	type?: 'text' | 'password' | 'email' | 'number'
	placeholder?: string
	value?: string
	error?: string
	disabled?: boolean
	className?: string
	onChange?: (value: string) => void
}

export const MockInput = ({
	type = 'text',
	placeholder = '',
	value = '',
	error,
	disabled = false,
	className = '',
	onChange = () => {},
}: MockInputProps) => {
	return (
		<div className="mock-input-wrapper">
			<input
				type={type}
				className={`mock-input ${error ? 'mock-input-error' : ''} ${className}`}
				placeholder={placeholder}
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(e.target.value)}
			/>
			{error ? <div className="mock-input-error-message">{error}</div> : null}
		</div>
	)
}
