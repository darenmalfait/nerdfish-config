import * as React from 'react'

interface MockBadgeProps {
	variant?: 'default' | 'success' | 'warning' | 'error'
	size?: 'sm' | 'md' | 'lg'
	children: React.ReactNode
	className?: string
}

export const MockBadge = ({
	variant = 'default',
	size = 'md',
	children,
	className = '',
}: MockBadgeProps) => {
	return (
		<span
			className={`mock-badge mock-badge-${variant} mock-badge-${size} ${className}`}
		>
			{children}
		</span>
	)
}
