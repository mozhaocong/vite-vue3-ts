module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint', 'prettier'],
	rules: {
		indent: 'off',
		camelcase: 'off',
		'comma-dangle': [2, 'never'],
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'prettier/prettier': [
			'error',
			{ endOfLine: 'auto' },
			{
				printWidth: 150,
				tabWidth: 2,
				useTabs: true
			}
		]
	}
}
