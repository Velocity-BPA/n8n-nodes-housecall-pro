/**
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['@typescript-eslint', 'n8n-nodes-base'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:n8n-nodes-base/community',
		'prettier',
	],
	env: {
		node: true,
		es2021: true,
	},
	rules: {
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'warn',
		'n8n-nodes-base/node-param-description-missing-from-dynamic-options': 'off',
		'n8n-nodes-base/node-param-description-missing-from-limit': 'off',
		'no-console': ['warn', { allow: ['warn', 'error'] }],
	},
	ignorePatterns: ['dist/**', 'node_modules/**', 'test/**', '*.js', '!.eslintrc.js'],
};
