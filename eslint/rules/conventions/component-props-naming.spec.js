import { ruleTester } from '../rule-tester.js'
import { componentPropsNamingRule } from './component-props-naming.js'

ruleTester.run('component-props-naming', componentPropsNamingRule, {
	valid: [
		'type ButtonProps = {}\nfunction Button(props: ButtonProps) { return null }',
		"import type { ButtonProps } from './button'\nfunction PrimaryButton(props: ButtonProps) { return null }",
		'type FieldProps = {}\nfunction TextField(p: FieldProps) { return null }\nfunction NumberField(p: FieldProps) { return null }',
		'type CardProps = {}\nfunction Card(props: PropsWithChildren<CardProps>) { return null }',
		'type Options = {}\nfunction parse(options: Options) { return null }',
		'function Button({ label }: { label: string }) { return null }',
	],
	invalid: [
		{
			code: 'type Props = {}\nfunction Button({ label }: Props) { return null }',
			output:
				'type ButtonProps = {}\nfunction Button({ label }: ButtonProps) { return null }',
			errors: [
				{
					messageId: 'invalidPropsTypeName',
					data: {
						component: 'Button',
						expected: 'ButtonProps',
						actual: 'Props',
					},
				},
			],
		},
		{
			code: 'interface Props {}\nconst Button = (props: Props) => null',
			output:
				'interface ButtonProps {}\nconst Button = (props: ButtonProps) => null',
			errors: [{ messageId: 'invalidPropsTypeName' }],
		},
		{
			code: 'type ButtonProps = {}\nfunction IconButton(props: ButtonProps) { return null }',
			output:
				'type IconButtonProps = {}\nfunction IconButton(props: IconButtonProps) { return null }',
			errors: [{ messageId: 'invalidPropsTypeName' }],
		},
		{
			code: 'export type Props = {}\nfunction Button(props: Props) { return null }',
			output: null,
			errors: [{ messageId: 'invalidPropsTypeName' }],
		},
	],
})
