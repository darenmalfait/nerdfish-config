import {
	getJsxElementName,
	isThirdPartyJsxElement,
	toCompoundPartName,
} from '../util.js'

const COMPONENT_NAME = /^[A-Z]/

/** `isThread` or `isEditing={false}`: a literal on/off switch. */
function isBooleanAttribute(attribute) {
	if (attribute.type !== 'JSXAttribute') {
		return false
	}

	if (attribute.value === null) {
		return true
	}

	return (
		attribute.value.type === 'JSXExpressionContainer' &&
		typeof attribute.value.expression.value === 'boolean'
	)
}

export const preferExplicitVariantsRule = {
	meta: {
		type: 'suggestion',

		docs: {
			description:
				'Disallow configuring a component with many boolean props; render an explicit variant component instead.',
			guidelineRuleId: 'patterns-explicit-variants',
		},

		schema: [
			{
				type: 'object',
				properties: {
					max: {
						type: 'integer',
						minimum: 0,
						description:
							'How many boolean props one element may receive before it is reported (default: 2).',
					},
				},
				additionalProperties: false,
			},
		],

		messages: {
			preferExplicitVariants:
				'`<{{elementName}}>` is configured with {{count}} boolean props ({{propNames}}), so readers have to work out which mode it is in. Make `{{rootName}}` a compound component instead: separately exported parts like `<{{rootName}}Frame>` and `<{{rootName}}{{partName}}>` (not `{{rootName}}.{{partName}}`) that share state through a context provider. Then render an explicit variant that composes only the parts it needs (e.g. `<{{variantName}} />`). Renaming the props does not fix this. See vercel-composition-patterns: patterns-explicit-variants, architecture-compound-components.',
		},
	},

	create(context) {
		const max = context.options[0]?.max ?? 2

		/**
		 * Checks:
		 * <ThreadComposer channelId="abc" /> ✅
		 * <Input required disabled /> ✅ (two flags)
		 * <Dialog modal open keepMounted /> ✅ (imported from a package, not ours to change)
		 * <Composer isThread isEditing={false} showAttachments /> ❌
		 */
		return {
			JSXOpeningElement(node) {
				const elementName = getJsxElementName(node.name)

				if (
					!elementName ||
					!COMPONENT_NAME.test(elementName) ||
					isThirdPartyJsxElement(context.sourceCode, node.name)
				) {
					return
				}

				const booleanAttributes = node.attributes.filter(isBooleanAttribute)

				if (booleanAttributes.length <= max) {
					return
				}

				context.report({
					node,
					messageId: 'preferExplicitVariants',
					data: {
						elementName,
						rootName: elementName.split('.')[0],
						partName: toCompoundPartName(booleanAttributes[0].name.name),
						variantName: `${toCompoundPartName(booleanAttributes[0].name.name)}${elementName.split('.')[0]}`,
						count: booleanAttributes.length,
						propNames: booleanAttributes
							.map((attribute) => `\`${attribute.name.name}\``)
							.join(', '),
					},
				})
			},
		}
	},
}
