interface MockCheckboxProps {
	checked?: boolean
	label?: string
	disabled?: boolean
	error?: string
	className?: string
	onChange?: (checked: boolean) => void
}

export const MockCheckbox = ({
	checked = false,
	label,
	disabled = false,
	error,
	className = '',
	onChange = () => {},
}: MockCheckboxProps) => {
	return (
		<div className={`mock-checkbox-wrapper ${className}`}>
			<label className={disabled ? 'mock-checkbox-disabled' : ''}>
				<input
					type="checkbox"
					checked={checked}
					disabled={disabled}
					onChange={(e) => onChange(e.target.checked)}
					className="mock-checkbox"
				/>
				{label}
			</label>
			{error ? <div className="mock-checkbox-error">{error}</div> : null}
		</div>
	)
}
