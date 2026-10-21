export function Head() {
	return (
		<head>
			<script src="/app.js" defer />
			<script src="https://example.com/analytics.js" async />
			<script src="/entry.js" type="module" />
			<script
				dangerouslySetInnerHTML={{
					__html: 'document.documentElement.dataset.theme = "dark"',
				}}
			/>
		</head>
	)
}
