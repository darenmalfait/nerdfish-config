interface MockSelectOption {
	value: string
	label: string
}

interface MockSelectProps {
	options?: MockSelectOption[]
	value?: string
	placeholder?: string
	disabled?: boolean
	className?: string
	onChange?: (value: string) => void
}

export const MockSelect = ({
	options = [],
	value = '',
	placeholder = 'Select an option',
	disabled = false,
	className = '',
	onChange = () => {},
}: MockSelectProps) => {
	return (
		<div className={`mock-select ${className}`}>
			<select
				value={value}
				disabled={disabled}
				onChange={(e) => onChange(e.target.value)}
			>
				<option value="" disabled>
					{placeholder}
				</option>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	)
}
