export function getCallName(callee) {
	if (!callee) {
		return null
	}

	if (callee.type === 'Identifier') {
		return callee.name
	}

	if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.property.type === 'Identifier'
	) {
		return callee.property.name
	}

	return null
}
