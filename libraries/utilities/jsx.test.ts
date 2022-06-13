import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { asArray } from './jsx.ts';

describe('asArray()', () => {
	it('Turns a single value into an array of one', async () => {
		expect(await asArray('a')).toEqual(['a']);
		expect(await asArray(null)).toEqual([]);
		expect(await asArray(undefined)).toEqual([]);
	});
	it('Flattens nested/promised arrays', async () => {
		const children = await asArray(['a', ['b'], Promise.resolve(['c']), [Promise.resolve(['d'])]]);
		expect(children).toEqual(['a', 'b', 'c', 'd']);
	});
	it('Filters out null and undefined', async () => {
		const children = await asArray(['a', null, ['b', undefined]]);
		expect(children).toEqual(['a', 'b']);
	});
});

run();
