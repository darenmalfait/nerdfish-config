import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'

const ERROR = 'error'
const WARN = 'warn'
const OFF = 'off'

function has(pkg) {
	try {
		import.meta.resolve(pkg, import.meta.url)
		return true
	} catch {
		return false
	}
}

const hasTypeScript = has('typescript')
const hasReact = has('react')
const hasTestingLibrary = has('@testing-library/dom')
const hasJestDom = has('@testing-library/jest-dom')
const hasVitest = has('vitest')
const vitestFiles = ['**/__tests__/**/*', '**/*.test.*']
const testFiles = ['**/tests/**', '**/#tests/**', ...vitestFiles]
const playwrightFiles = ['**/e2e/**']

export const config = [
	{
		ignores: [
			'**/.cache/**',
			'**/node_modules/**',
			'**/build/**',
			'**/public/build/**',
			'**/playwright-report/**',
			'**/server-build/**',
			'**/dist/**',
		],
	},

	// all files
	{
		plugins: {
			import: (await import('eslint-plugin-import-x')).default,
			unicorn: (await import('eslint-plugin-unicorn')).default,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			// base rules
			'accessor-pairs': ERROR,
			'array-callback-return': ERROR,
			'block-scoped-var': ERROR,
			'default-case': ERROR,
			'default-case-last': ERROR,
			'no-unexpected-multiline': ERROR,
			'no-return-await': ERROR,
			'dot-notation': ERROR,
			'for-direction': ERROR,
			'func-name-matching': ERROR,
			'func-names': ERROR,
			'getter-return': [ERROR, { allowImplicit: true }],
			'id-denylist': ERROR,
			'id-match': [
				ERROR,
				// camelCase, PascalCase, __filename, CONST_VALUE, stream$, $el
				'^\\$?(__)?(([A-Z]|[a-z]|[0-9]+)|([A-Z_]))*\\$?$',
			],
			'logical-assignment-operators': WARN,
			'max-depth': [ERROR, 4],
			'max-nested-callbacks': [ERROR, 7],
			'max-params': [ERROR, 7],
			'max-statements-per-line': [ERROR, { max: 1 }],
			'new-cap': ERROR,
			'no-alert': ERROR,
			'no-array-constructor': ERROR,
			'no-await-in-loop': ERROR,
			'no-bitwise': ERROR,
			'no-caller': ERROR,
			'no-case-declarations': ERROR,
			'no-class-assign': ERROR,
			'no-compare-neg-zero': ERROR,
			'no-cond-assign': ERROR,
			'no-const-assign': ERROR,
			'no-constant-binary-expression': ERROR,
			'no-constant-condition': ERROR,
			'no-constructor-return': ERROR,
			'no-control-regex': ERROR,
			'no-debugger': ERROR,
			'no-delete-var': ERROR,
			'no-div-regex': ERROR,
			'no-dupe-args': ERROR,
			'no-dupe-class-members': ERROR,
			'no-dupe-else-if': ERROR,
			'no-dupe-keys': ERROR,
			'no-duplicate-case': ERROR,
			'no-duplicate-imports': ERROR,
			'no-empty': ERROR,
			'no-empty-character-class': ERROR,
			'no-empty-pattern': ERROR,
			'no-empty-static-block': ERROR,
			'no-eval': ERROR,
			'no-ex-assign': ERROR,
			'no-extend-native': ERROR,
			'no-extra-bind': ERROR,
			'no-extra-label': ERROR,
			'no-fallthrough': ERROR,
			'no-func-assign': ERROR,
			'no-global-assign': ERROR,
			'no-implicit-globals': ERROR,
			'no-implied-eval': ERROR,
			'no-import-assign': ERROR,
			'no-inner-declarations': ERROR,
			'no-invalid-regexp': ERROR,
			'no-invalid-this': ERROR,
			'no-irregular-whitespace': ERROR,
			'no-iterator': ERROR,
			'no-label-var': ERROR,
			'no-labels': ERROR,
			'no-lone-blocks': ERROR,
			'no-lonely-if': ERROR,
			'no-loop-func': ERROR,
			'no-loss-of-precision': ERROR,
			'no-multi-assign': ERROR, // it's handy, but harder to read
			'no-multi-str': ERROR,
			'no-new': ERROR,
			'no-new-func': ERROR,
			'no-new-native-nonconstructor': ERROR,
			'no-new-object': ERROR,
			'no-new-symbol': ERROR,
			'no-new-wrappers': ERROR,
			'no-nonoctal-decimal-escape': ERROR,
			'no-obj-calls': ERROR,
			'no-octal': ERROR,
			'no-octal-escape': ERROR,
			'no-proto': ERROR,
			'no-regex-spaces': ERROR,
			'no-restricted-globals': [ERROR, 'event', 'fdescribe'],
			'no-restricted-syntax': [ERROR, 'WithStatement'],
			'no-return-assign': ERROR,
			'no-script-url': ERROR,
			'no-self-assign': ERROR,
			'no-self-compare': ERROR,
			'no-sequences': ERROR,
			'no-setter-return': ERROR,
			'no-shadow': ERROR,
			'no-shadow-restricted-names': ERROR,
			'no-sparse-arrays': ERROR,
			'no-template-curly-in-string': ERROR,
			'no-this-before-super': ERROR,
			'no-throw-literal': ERROR,
			'no-undef': ERROR,
			'no-undef-init': ERROR,
			'no-unmodified-loop-condition': ERROR,
			'no-unneeded-ternary': ERROR,
			'no-unreachable': ERROR,
			'no-unreachable-loop': ERROR,
			'no-unsafe-finally': ERROR,
			'no-unsafe-negation': ERROR,
			'no-unsafe-optional-chaining': ERROR,
			'no-unused-labels': ERROR,
			'no-unused-private-class-members': ERROR,
			'no-unused-vars': [
				ERROR,
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^ignored',
				},
			],
			'no-use-before-define': [ERROR, 'nofunc'],
			'no-useless-backreference': ERROR,
			'no-useless-call': ERROR,
			'no-useless-catch': ERROR,
			'no-useless-computed-key': ERROR,
			'no-useless-concat': ERROR,
			'no-useless-constructor': ERROR,
			'no-useless-escape': ERROR,
			'no-useless-rename': ERROR,
			'no-useless-return': ERROR,
			'no-var': ERROR,
			'object-shorthand': [ERROR, 'properties'], // methods are optional so you can specify a name if you want
			'one-var': [ERROR, { initialized: 'never', uninitialized: 'always' }],
			'prefer-arrow-callback': [
				ERROR,
				{ allowNamedFunctions: true, allowUnboundThis: true },
			],
			'prefer-const': ERROR,
			'prefer-exponentiation-operator': WARN,
			'prefer-numeric-literals': ERROR,
			'prefer-object-has-own': ERROR,
			'prefer-object-spread': WARN,
			'prefer-rest-params': ERROR,
			'prefer-spread': ERROR,
			'prefer-template': ERROR,
			radix: ERROR,
			'require-yield': ERROR,
			'symbol-description': ERROR,
			'unicorn/filename-case': [WARN, { case: 'kebabCase' }],
			'use-isnan': ERROR,
			'valid-typeof': ERROR,
			'vars-on-top': ERROR,
			strict: ERROR,
			yoda: ERROR,

			// best practices
			'no-console': [ERROR, { allow: [WARN, 'info', ERROR] }],
			'no-warning-comments': [
				ERROR,
				{ terms: ['FIXME'], location: 'anywhere' },
			],

			// import
			'import/no-duplicates': [WARN, { 'prefer-inline': true }],
			'import/order': [
				WARN,
				{
					alphabetize: { order: 'asc', caseInsensitive: true },
					pathGroups: [{ pattern: '#*/**', group: 'internal' }],
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
				},
			],

			// complexity rules
			complexity: [ERROR, 20],
			'max-lines': [
				ERROR,
				{ max: 2500, skipBlankLines: false, skipComments: false },
			],
		},
	},

	// JSX/TSX files
	hasReact
		? {
				files: ['**/*.ts?(x)', '**/*.js?(x)'],
				settings: {
					react: {
						version: 'detect',
					},
				},
				plugins: {
					react: (await import('eslint-plugin-react')).default,
				},
				languageOptions: {
					parser: (await import('typescript-eslint')).parser,
					parserOptions: {
						jsx: true,
					},
				},
				rules: {
					'react/jsx-key': WARN,
					'react/display-name': [ERROR, { ignoreTranspilerName: false }],
					'react/iframe-missing-sandbox': WARN,
					'react/jsx-closing-tag-location': ERROR,
					'react/jsx-curly-brace-presence': [
						WARN,
						{ props: 'never', children: 'ignore' },
					],
					'react/jsx-filename-extension': [
						ERROR,
						{ extensions: ['.jsx', '.tsx'] },
					],
					'react/jsx-no-comment-textnodes': ERROR,
					'react/jsx-no-duplicate-props': ERROR,
					'react/jsx-no-leaked-render': [
						ERROR,
						{ validStrategies: ['ternary'] },
					],
					'react/jsx-no-script-url': ERROR,
					'react/jsx-no-target-blank': ERROR,
					'react/jsx-no-undef': ERROR,
					'react/jsx-no-useless-fragment': WARN,
					'react/jsx-pascal-case': ERROR,
					'react/jsx-uses-react': ERROR,
					'react/jsx-uses-vars': ERROR,
					'react/no-access-state-in-setstate': ERROR,
					'react/no-arrow-function-lifecycle': ERROR,
					'react/no-danger-with-children': ERROR,
					'react/no-deprecated': ERROR,
					'react/no-did-mount-set-state': ERROR,
					'react/no-did-update-set-state': ERROR,
					'react/no-direct-mutation-state': ERROR,
					'react/no-find-dom-node': ERROR,
					'react/no-invalid-html-attribute': ERROR,
					'react/no-is-mounted': ERROR,
					'react/no-namespace': ERROR,
					'react/no-redundant-should-component-update': ERROR,
					'react/no-render-return-value': ERROR,
					'react/no-string-refs': ERROR,
					'react/no-this-in-sfc': ERROR,
					'react/no-typos': ERROR,
					'react/no-unescaped-entities': WARN,
					'react/no-unknown-property': ERROR,
					'react/no-unsafe': WARN, // if you need it there should be a comment explaining why
					'react/no-unstable-nested-components': [
						ERROR,
						{ allowAsProps: true },
					],
					'react/no-unused-class-component-methods': ERROR,
					'react/no-unused-state': ERROR,
					'react/no-will-update-set-state': ERROR,
					'react/require-render-return': ERROR,
					'react/self-closing-comp': ERROR,
					'react/style-prop-object': ERROR,
					'react/void-dom-elements-no-children': ERROR,
				},
			}
		: null,

	// react-hook rules are applicable in ts/js/tsx/jsx, but only with React as a
	// dep
	hasReact
		? {
				files: ['**/*.ts?(x)', '**/*.js?(x)'],
				settings: {
					react: {
						version: 'detect',
					},
				},
				plugins: {
					'react-hooks': fixupPluginRules(
						await import('eslint-plugin-react-hooks'),
					),
				},
				rules: {
					'react-hooks/rules-of-hooks': ERROR,
					'react-hooks/exhaustive-deps': WARN,
				},
			}
		: null,

	// JS and JSX files
	{
		files: ['**/*.js?(x)'],
		rules: {
			// most of these rules are useful for JS but not TS because TS handles these better
			// if it weren't for https://github.com/import-js/eslint-plugin-import/issues/2132
			// we could enable this :(
			// 'import/no-unresolved': ERROR,
			'no-unused-vars': [
				WARN,
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^ignored',
				},
			],
		},
	},

	// TS and TSX files
	hasTypeScript
		? {
				files: ['**/*.ts?(x)'],
				languageOptions: {
					parser: (await import('typescript-eslint')).parser,
					parserOptions: {
						projectService: true,
					},
				},
				plugins: {
					'@typescript-eslint': (await import('typescript-eslint')).plugin,
				},
				rules: {
					'no-unused-vars': OFF,
					'@typescript-eslint/no-unused-vars': [
						WARN,
						{
							args: 'after-used',
							argsIgnorePattern: '^_',
							ignoreRestSiblings: true,
							varsIgnorePattern: '^ignored',
						},
					],
					'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],
					'@typescript-eslint/consistent-type-imports': [
						WARN,
						{
							prefer: 'type-imports',
							disallowTypeAnnotations: true,
							fixStyle: 'inline-type-imports',
						},
					],

					'no-var': ERROR, // TS transpiles let/const to var, so no need for vars any more
					'prefer-const': ERROR, // TS provides better types with const
					'prefer-rest-params': ERROR, // TS provides better types with rest args over arguments
					'prefer-spread': ERROR, // TS transpiles spread to apply, so no need for manual apply

					'dot-notation': OFF,
					'@typescript-eslint/dot-notation': ERROR,

					'no-array-constructor': OFF,
					'@typescript-eslint/no-array-constructor': ERROR,

					'no-dupe-class-members': OFF,
					'@typescript-eslint/no-dupe-class-members': OFF, // ts(2393) & ts(2300)

					'no-implied-eval': ERROR,
					'@typescript-eslint/no-implied-eval': ERROR,

					'no-invalid-this': OFF,
					'@typescript-eslint/no-invalid-this': ERROR,

					'no-loop-func': OFF,
					'@typescript-eslint/no-loop-func': ERROR,

					'no-loss-of-precision': OFF,
					'@typescript-eslint/no-loss-of-precision': ERROR,

					'no-return-await': OFF,
					'@typescript-eslint/return-await': ERROR,

					'no-shadow': OFF,
					'@typescript-eslint/no-shadow': ERROR,

					'no-use-before-define': OFF,
					'@typescript-eslint/no-use-before-define': [ERROR, 'nofunc'],

					'no-useless-constructor': OFF,
					'@typescript-eslint/no-useless-constructor': ERROR,

					'@typescript-eslint/adjacent-overload-signatures': ERROR,
					'@typescript-eslint/await-thenable': ERROR,
					'@typescript-eslint/ban-ts-comment': ERROR,
					'@typescript-eslint/ban-tslint-comment': ERROR,
					'@typescript-eslint/no-base-to-string': WARN, // prettier reformats their "correct" example anyway 🤷‍♂️
					'@typescript-eslint/no-dynamic-delete': ERROR,
					'@typescript-eslint/no-empty-interface': ERROR,
					'@typescript-eslint/no-extra-non-null-assertion': ERROR,
					'@typescript-eslint/no-extraneous-class': ERROR, // stay away from classes when you can
					'@typescript-eslint/no-floating-promises': WARN, // not a bad rule, but can be annoying
					'@typescript-eslint/no-for-in-array': ERROR, // Not ready for this yet // I personally prefer relying on inference where possible, but I don't want to lint for it.
					'@typescript-eslint/no-invalid-void-type': WARN,
					'@typescript-eslint/no-misused-new': ERROR,
					'@typescript-eslint/no-misused-promises': [
						WARN,
						{ checksVoidReturn: false },
					],
					'@typescript-eslint/no-namespace': ERROR,
					'@typescript-eslint/no-non-null-asserted-optional-chain': ERROR,
					'@typescript-eslint/no-non-null-assertion': ERROR, // sometimes you can't do it any other way
					'@typescript-eslint/no-this-alias': ERROR,
					'@typescript-eslint/no-unnecessary-boolean-literal-compare': WARN,
					'@typescript-eslint/no-unnecessary-condition': ERROR,
					'@typescript-eslint/no-unnecessary-qualifier': WARN, // I'm not sure I understand this one
					'@typescript-eslint/no-unnecessary-type-assertion': ERROR,
					'@typescript-eslint/no-unnecessary-type-constraint': ERROR, // Not ready for this yet // Not ready for this yet // Not ready for this yet // Not ready for this yet // Not ready for this yet
					'@typescript-eslint/no-var-requires': ERROR,
					'@typescript-eslint/prefer-as-const': ERROR,
					'@typescript-eslint/prefer-enum-initializers': ERROR, // makes total sense // I prefer for of, but I don't want to lint for it
					'@typescript-eslint/prefer-includes': ERROR, // normally I wouldn't but includes is just so much better
					'@typescript-eslint/prefer-literal-enum-member': ERROR,
					'@typescript-eslint/prefer-namespace-keyword': ERROR,
					'@typescript-eslint/prefer-nullish-coalescing': ERROR,
					'@typescript-eslint/prefer-optional-chain': ERROR,
					'@typescript-eslint/prefer-reduce-type-parameter': WARN,
					'@typescript-eslint/prefer-string-starts-ends-with': ERROR,
					'@typescript-eslint/prefer-ts-expect-error': ERROR,
					'@typescript-eslint/restrict-plus-operands': ERROR,
					'@typescript-eslint/switch-exhaustiveness-check': ERROR,
					'@typescript-eslint/triple-slash-reference': ERROR,
					'@typescript-eslint/unbound-method': ERROR,
					'@typescript-eslint/unified-signatures': WARN,
				},
			}
		: null,

	// This assumes test files are those which are in the test directory or have
	// *.test.* in the filename. If a file doesn't match this assumption, then it
	// will not be allowed to import test files.
	{
		files: ['**/*.ts?(x)', '**/*.js?(x)'],
		ignores: testFiles,
		rules: {
			'no-restricted-imports': [
				ERROR,
				{
					patterns: [
						{
							group: testFiles,
							message: 'Do not import test files in source files',
						},
					],
				},
			],
		},
	},

	hasTestingLibrary
		? {
				files: testFiles,
				ignores: [...playwrightFiles],
				plugins: {
					'testing-library': (await import('eslint-plugin-testing-library'))
						.default,
				},
				rules: {
					'testing-library/no-unnecessary-act': [ERROR, { isStrict: false }],
					'testing-library/no-wait-for-side-effects': ERROR,
					'testing-library/prefer-find-by': ERROR,
				},
			}
		: null,

	hasJestDom
		? {
				files: testFiles,
				ignores: [...playwrightFiles],
				plugins: {
					'jest-dom': (await import('eslint-plugin-jest-dom')).default,
				},
				rules: {
					'jest-dom/prefer-checked': ERROR,
					'jest-dom/prefer-enabled-disabled': ERROR,
					'jest-dom/prefer-focus': ERROR,
					'jest-dom/prefer-required': ERROR,
				},
			}
		: null,

	hasVitest
		? {
				files: testFiles,
				ignores: [...playwrightFiles],
				plugins: {
					vitest: (await import('eslint-plugin-vitest')).default,
				},
				rules: {
					// you don't want the editor to autofix this, but we do want to be
					// made aware of it
					'vitest/no-focused-tests': [WARN, { fixable: false }],
				},
			}
		: null,
].filter(Boolean)

// this is for backward compatibility
export default config
