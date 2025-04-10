import * as React from 'react'

interface MockTab {
	id: string
	label: string
	content: React.ReactNode
}

interface MockTabsProps {
	tabs: MockTab[]
	activeTab?: string
	className?: string
	onTabChange?: (tabId: string) => void
}

export const MockTabs = ({
	tabs = [],
	activeTab,
	className = '',
	onTabChange = () => {},
}: MockTabsProps) => {
	const currentTab = activeTab ?? tabs[0]?.id

	return (
		<div className={`mock-tabs ${className}`}>
			<div className="mock-tabs-list">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						className={`mock-tab ${currentTab === tab.id ? 'mock-tab-active' : ''}`}
						onClick={() => onTabChange(tab.id)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="mock-tab-content">
				{tabs.find((tab) => tab.id === currentTab)?.content}
			</div>
		</div>
	)
}
