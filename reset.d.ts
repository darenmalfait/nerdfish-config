import '@total-typescript/ts-reset'
import '@total-typescript/ts-reset/dom'

// eslint-disable-next-line react/no-typos
import 'react'

declare module 'react' {
	// support css variables
	// biome-ignore lint/style/useNamingConvention: this is fine CSS
	interface CSSProperties {
		[key: `--${string}`]: string | number
	}
}
