import type * as React from 'react'

type ListProps<TItem> = {
	items: TItem[]
	renderItem: (props: { item: TItem; index: number }) => React.ReactNode
}

function List<TItem>({ items, renderItem }: ListProps<TItem>) {
	return <ul>{items.map((item, index) => renderItem({ item, index }))}</ul>
}

export function Names({ names }: { names: string[] }) {
	return (
		<List
			items={names}
			renderItem={({ item, index }) => <li key={index}>{item}</li>}
		/>
	)
}
