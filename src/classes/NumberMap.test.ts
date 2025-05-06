import { describe, it } from 'std/testing/bdd';
import { expect } from 'std/expect'; 

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
