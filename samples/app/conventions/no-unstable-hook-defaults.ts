import { useState } from 'react'

declare function useQuery(): { data?: string[] }

const EMPTY_ITEMS: string[] = []

export function useSelection({ items = EMPTY_ITEMS }: { items?: string[] }) {
	const { data = EMPTY_ITEMS } = useQuery()
	const [selected, setSelected] = useState(items[0])

	return { data, selected, setSelected }
}
