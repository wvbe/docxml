import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { NumberMap } from './NumberMap.ts';

describe('NumberMap', () => {
	const map = new NumberMap<boolean>();

	it('.add', () => {
		map.set(1, true);
		expect(map.add(true)).toBe(0);
		expect(map.add(true)).toBe(2);
	});

	it('.array', () => {
		expect(map.array()).toEqual([true, true, true]);
	});
});

run();
