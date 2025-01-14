import * as React from 'react'

interface MockCardProps {
	title?: string
	footer?: React.ReactNode
	className?: string
	children?: React.ReactNode
}

export const MockCard = ({
	title,
	footer,
	className = '',
	children,
}: MockCardProps) => {
	return (
		<div className={`mock-card ${className}`}>
			{title ? <div className="mock-card-header">{title}</div> : null}
			<div className="mock-card-content">{children}</div>
			{footer ? <div className="mock-card-footer">{footer}</div> : null}
		</div>
	)
}
