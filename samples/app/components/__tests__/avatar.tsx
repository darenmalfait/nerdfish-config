interface MockAvatarProps {
	src?: string
	alt?: string
	size?: 'sm' | 'md' | 'lg'
	name?: string
	className?: string
	loading?: boolean
}

export const MockAvatar = ({
	src = '',
	alt = '',
	size = 'md',
	name = '',
	className = '',
	loading = false,
}: MockAvatarProps) => {
	const getInitials = (displayName: string) => {
		return displayName
			.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
	}

	return (
		<div
			className={`mock-avatar ${className} ${loading ? 'mock-loading' : ''}`}
			data-size={size}
		>
			{src ? (
				<div className="mock-image">{alt}</div>
			) : (
				<div className="mock-initials">{name ? getInitials(name) : 'NA'}</div>
			)}
		</div>
	)
}
