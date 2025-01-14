interface MockSwizzleProps {
	components?: string[]
	onSwizzle?: (component: string) => void
	className?: string
}

export const MockSwizzle = ({
	components = [],
	onSwizzle = () => {},
	className = '',
}: MockSwizzleProps) => {
	return (
		<div className={`mock-swizzle ${className}`}>
			{components.map((component) => (
				<button
					key={component}
					className="mock-swizzle-button"
					onClick={() => onSwizzle(component)}
				>
					{component}
				</button>
			))}
		</div>
	)
}
