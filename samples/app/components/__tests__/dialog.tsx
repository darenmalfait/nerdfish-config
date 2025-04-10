import * as React from 'react'

interface MockDialogProps {
	open?: boolean
	title?: string
	children: React.ReactNode
	onClose?: () => void
	className?: string
}

export const MockDialog = ({
	open = false,
	title,
	children,
	onClose = () => {},
	className = '',
}: MockDialogProps) => {
	if (!open) return null

	return (
		<div className="mock-dialog-overlay" onClick={onClose}>
			<div
				className={`mock-dialog ${className}`}
				onClick={(e) => e.stopPropagation()}
			>
				{title ? <div className="mock-dialog-header">{title}</div> : null}
				<div className="mock-dialog-content">{children}</div>
				<button className="mock-dialog-close" onClick={onClose}>
					×
				</button>
			</div>
		</div>
	)
}
