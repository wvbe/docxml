/**
 * Running this script rebuilds it as a NodeJS compatible npm package.
 */

import { build, emptyDir } from 'https://deno.land/x/dnt@0.25.2/mod.ts';

const VERSION = Deno.args[0];
if (!VERSION) {
	throw new Error('Please specify a version, eg. "deno task dnt 1.0.0".');
}

const msg = ` Creating npm package for version ${VERSION} `;
console.log('-'.repeat(msg.length) + '\n' + msg + '\n' + '-'.repeat(msg.length));

await emptyDir('./npm');

await build({
	entryPoints: ['./mod.ts'],
	outDir: './npm',
	typeCheck: true,
	test: false,
	declaration: true,
	skipSourceOutput: true,
	shims: {
		deno: true,
		custom: [
			{
				package: { name: 'crypto' },
				globalNames: [{ name: 'crypto', exportName: 'default' }],
			},
		],
	},
	package: {
		name: 'docxml',
		version: VERSION,
		description: 'TypeScript (component) library for building and parsing a DOCX file',
		author: {
			name: 'Wybe Minnebo',
			email: 'wybe@x-54.com',
			url: 'https://github.com/wvbe',
		},
		contributors: [],
		homepage: 'https://github.com/wvbe/docxml',
		repository: {
			type: 'git',
			url: 'git+https://github.com/wvbe/docxml.git',
		},
		bugs: {
			url: 'https://github.com/wvbe/docxml/issues',
		},
		license: 'none',
		keywords: ['ooxml', 'docx', 'components', 'deno', 'node', 'jsx'],
		type: 'module',
		main: 'script/mod.js',
		module: 'esm/mod.js',
		typings: 'esm/mod.d.ts',
	},
	mappings: {
		'https://esm.sh/fontoxpath@3.26.0': {
			name: 'fontoxpath',
			version: '3.27.1',
		},
		'https://esm.sh/fontoxpath@3.27.1?pin=v96': {
			name: 'fontoxpath',
			version: '3.27.1',
		},
		'https://esm.sh/slimdom@4.0.2?pin=v96': {
			name: 'slimdom',
			version: '4.0.2',
		},
	},
});

await Deno.copyFile('README.md', 'npm/README.md');
