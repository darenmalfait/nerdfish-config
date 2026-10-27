const NOOP = () => {}

interface MockToastProps {
	type?: 'success' | 'error' | 'warning' | 'info'
	message: string
	duration?: number
	onClose?: () => void
}

export function MockToast({
	type = 'info',
	message,
	duration = 3000,
	onClose: handleClose = NOOP,
}: MockToastProps) {
	return (
		<div
			className={`mock-toast mock-toast-${type}`}
			data-duration={duration}
			onClick={handleClose}
		>
			<div className="mock-toast-message">{message}</div>
			<button type="button" className="mock-toast-close" onClick={handleClose}>
				×
			</button>
		</div>
	)
}
