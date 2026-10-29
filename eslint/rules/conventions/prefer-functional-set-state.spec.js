import { ruleTester } from '../rule-tester.js'

import { preferFunctionalSetStateRule } from './prefer-functional-set-state.js'

ruleTester.run('prefer-functional-set-state', preferFunctionalSetStateRule, {
	valid: [
		'function List() { const [items, setItems] = useState([]); return <button onClick={() => setItems((prev) => [...prev, item])} /> }',
		'function List() { const [items, setItems] = useState([]); return <button onClick={() => setItems([])} /> }',
		'function Toggle() { const [isOpen, setIsOpen] = useState(false); return <button onClick={() => setIsOpen(true)} /> }',
	],
	invalid: [
		{
			code: 'function List() { const [items, setItems] = useState([]); return <button onClick={() => setItems([...items, item])} /> }',
			errors: [
				{
					messageId: 'preferFunctionalSetState',
					suggestions: [
						{
							messageId: 'useUpdater',
							output:
								'function List() { const [items, setItems] = useState([]); return <button onClick={() => setItems((prevItems) => [...prevItems, item])} /> }',
						},
					],
				},
			],
		},
		{
			code: 'function Toggle() { const [isOpen, setIsOpen] = useState(false); return <button onClick={() => setIsOpen(!isOpen)} /> }',
			errors: [
				{
					messageId: 'preferFunctionalSetState',
					suggestions: [
						{
							messageId: 'useUpdater',
							output:
								'function Toggle() { const [isOpen, setIsOpen] = useState(false); return <button onClick={() => setIsOpen((prevIsOpen) => !prevIsOpen)} /> }',
						},
					],
				},
			],
		},
		{
			code: 'function Counter() { const [count, setCount] = useState(0); return <button onClick={() => setCount(count + 1)} /> }',
			errors: [
				{
					messageId: 'preferFunctionalSetState',
					suggestions: [
						{
							messageId: 'useUpdater',
							output:
								'function Counter() { const [count, setCount] = useState(0); return <button onClick={() => setCount((prevCount) => prevCount + 1)} /> }',
						},
					],
				},
			],
		},
	],
})
