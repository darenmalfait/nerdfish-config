export function Avatar({ name }: { name: string }) {
	return <span aria-label={name}>{name.slice(0, 1)}</span>
}
