import { type ReactNode } from 'react'

interface MockAccordionProps {
	items?: Array<{
		title: string
		content: ReactNode
	}>
	defaultOpen?: boolean
	className?: string
}

export const MockAccordion = ({
	items = [],
	defaultOpen = false,
	className = '',
}: MockAccordionProps) => {
	return (
		<div className={`mock-accordion ${className}`}>
			{items.map((item, index) => (
				<div key={index} className="mock-accordion-item">
					<div className="mock-accordion-header">{item.title}</div>
					{defaultOpen ? (
						<div className="mock-accordion-content">{item.content}</div>
					) : null}
				</div>
			))}
		</div>
	)
}
