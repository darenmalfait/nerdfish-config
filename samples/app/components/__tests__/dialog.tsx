import * as React from 'react'

const NOOP = () => {}

interface MockDialogProps {
	open?: boolean
	title?: string
	children: React.ReactNode
	onClose?: () => void
	className?: string
}

export function MockDialog({
	open = false,
	title,
	children,
	onClose: handleClose = NOOP,
	className = '',
}: MockDialogProps) {
	if (!open) return null

	return (
		<div className="mock-dialog-overlay" onClick={handleClose}>
			<div
				className={`mock-dialog ${className}`}
				onClick={(e) => e.stopPropagation()}
			>
				{title ? <div className="mock-dialog-header">{title}</div> : null}
				<div className="mock-dialog-content">{children}</div>
				<button
					type="button"
					className="mock-dialog-close"
					onClick={handleClose}
				>
					×
				</button>
			</div>
		</div>
	)
}
