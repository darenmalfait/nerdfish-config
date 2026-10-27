import { type ReactNode } from 'react'

const EMPTY_ARRAY: never[] = []

interface MockAccordionProps {
	items?: Array<{
		title: string
		content: ReactNode
	}>
	defaultOpen?: boolean
	className?: string
}

export function MockAccordion({
	items = EMPTY_ARRAY,
	defaultOpen = false,
	className = '',
}: MockAccordionProps) {
	return (
		<div className={`mock-accordion ${className}`}>
			{items.map((item) => (
				<div key={item.title} className="mock-accordion-item">
					<div className="mock-accordion-header">{item.title}</div>
					{defaultOpen ? (
						<div className="mock-accordion-content">{item.content}</div>
					) : null}
				</div>
			))}
		</div>
	)
}
