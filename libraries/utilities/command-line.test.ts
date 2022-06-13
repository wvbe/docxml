import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { getOptionsFromArgv } from './command-line.ts';

describe('getOptionsFromArgv()', () => {
	it('Parses the verbose flags', () => {
		expect(getOptionsFromArgv('--source in --destination out --debug'.split(' '))).toEqual({
			cwd: Deno.cwd(),
			stdin: Deno.stdin,
			stdout: Deno.stdout,
			source: 'in',
			destination: 'out',
			debug: true,
		});
	});
	it('Parses the concise flags', () => {
		expect(getOptionsFromArgv('-s in -d out -D'.split(' '))).toEqual({
			cwd: Deno.cwd(),
			stdin: Deno.stdin,
			stdout: Deno.stdout,
			source: 'in',
			destination: 'out',
			debug: true,
		});
	});
	it('Throws when the -s or -d flags have no value', () => {
		expect(() => getOptionsFromArgv('-s in -d'.split(' '))).toThrow();
		expect(() => getOptionsFromArgv('-s -d out'.split(' '))).toThrow();
	});
});

run();
