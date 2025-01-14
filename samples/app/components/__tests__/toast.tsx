interface MockToastProps {
	type?: 'success' | 'error' | 'warning' | 'info'
	message: string
	duration?: number
	onClose?: () => void
}

export const MockToast = ({
	type = 'info',
	message,
	duration = 3000,
	onClose = () => {},
}: MockToastProps) => {
	return (
		<div
			className={`mock-toast mock-toast-${type}`}
			data-duration={duration}
			onClick={onClose}
		>
			<div className="mock-toast-message">{message}</div>
			<button className="mock-toast-close" onClick={onClose}>
				×
			</button>
		</div>
	)
}
