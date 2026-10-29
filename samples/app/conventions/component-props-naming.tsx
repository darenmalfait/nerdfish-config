import { type PropsWithChildren } from 'react'

type ButtonProps = {
	label: string
}

export function Button({ label }: ButtonProps) {
	return <button type="button">{label}</button>
}

type FieldProps = {
	name: string
}

export function TextField({ name }: FieldProps) {
	return <input name={name} />
}

export function NumberField({ name }: FieldProps) {
	return <input name={name} type="number" />
}

type CardProps = {
	title: string
}

export function Card({ title, children }: PropsWithChildren<CardProps>) {
	return (
		<section>
			<h2>{title}</h2>
			{children}
		</section>
	)
}
