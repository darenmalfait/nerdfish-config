const NOOP = () => {}
const EMPTY_ARRAY: never[] = []

interface MockSwizzleProps {
	components?: string[]
	onSwizzle?: (component: string) => void
	className?: string
}

export function MockSwizzle({
	components = EMPTY_ARRAY,
	onSwizzle = NOOP,
	className = '',
}: MockSwizzleProps) {
	return (
		<div className={`mock-swizzle ${className}`}>
			{components.map((component) => (
				<button
					type="button"
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
