import { useState } from 'react'

export function TodoList() {
	const [items, setItems] = useState<string[]>([])
	const [isOpen, setIsOpen] = useState(false)

	function handleAdd() {
		setItems((prevItems) => [...prevItems, `Item ${prevItems.length + 1}`])
	}

	function handleToggle() {
		setIsOpen((prevIsOpen) => !prevIsOpen)
	}

	function handleClear() {
		setItems([])
	}

	return (
		<div>
			<button type="button" onClick={handleAdd}>
				Add
			</button>
			<button type="button" onClick={handleToggle}>
				{isOpen ? 'Hide' : 'Show'}
			</button>
			<button type="button" onClick={handleClear}>
				Clear
			</button>
			{isOpen ? <p>{items.join(', ')}</p> : null}
		</div>
	)
}
