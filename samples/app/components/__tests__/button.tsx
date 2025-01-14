import * as React from 'react'

interface MockButtonProps {
	variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
	size?: 'sm' | 'md' | 'lg'
	disabled?: boolean
	loading?: boolean
	className?: string
	children?: React.ReactNode
	onClick?: () => void
}

export const MockButton = ({
	variant = 'primary',
	size = 'md',
	disabled = false,
	loading = false,
	className = '',
	children,
	onClick = () => {},
}: MockButtonProps) => {
	return (
		<button
			className={`mock-button mock-button-${variant} mock-button-${size} ${className}`}
			disabled={disabled || loading}
			onClick={onClick}
			data-loading={loading}
		>
			{loading ? 'Loading...' : children}
		</button>
	)
}
