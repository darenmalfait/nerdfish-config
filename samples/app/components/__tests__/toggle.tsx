interface MockToggleProps {
	checked?: boolean
	disabled?: boolean
	size?: 'sm' | 'md' | 'lg'
	label?: string
	className?: string
	onChange?: (checked: boolean) => void
}

export const MockToggle = ({
	checked = false,
	disabled = false,
	size = 'md',
	label,
	className = '',
	onChange = () => {},
}: MockToggleProps) => {
	return (
		<label className={`mock-toggle-wrapper ${className}`}>
			<button
				role="switch"
				aria-checked={checked}
				className={`mock-toggle mock-toggle-${size} ${checked ? 'mock-toggle-on' : ''}`}
				disabled={disabled}
				onClick={() => onChange(!checked)}
			>
				<span className="mock-toggle-thumb" />
			</button>
			{label ? <span className="mock-toggle-label">{label}</span> : null}
		</label>
	)
}
