function handleScroll() {}

function handleTouchMove(event: TouchEvent) {
	event.preventDefault()
}

export function listen(element: HTMLElement) {
	window.addEventListener('scroll', handleScroll, { passive: true })
	element.addEventListener('touchmove', handleTouchMove, { passive: false })
	element.addEventListener('click', handleScroll)
}
