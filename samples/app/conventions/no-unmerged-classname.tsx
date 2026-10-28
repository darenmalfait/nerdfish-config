import { type ComponentProps } from 'react'

declare function cn(...values: unknown[]): string

export function Card({ className, ...props }: ComponentProps<'div'>) {
	return <div {...props} className={cn('rounded-lg p-4', className)} />
}
