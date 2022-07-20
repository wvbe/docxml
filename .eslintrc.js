module.exports = {
	extends: ['@wvbe/eslint-config/vanilla', '@wvbe/eslint-config/typescript'],

	rules: {
		// Disable the rules that Deno lint itself already does.
		'@typescript-eslint/no-explicit-any': 'off',
	},
};
