import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { evaluateXPathToFirstNode } from 'https://esm.sh/fontoxpath@3.26.0';
import { Node } from 'https://esm.sh/slimdom@3.1.0';
import { sync } from 'https://raw.githubusercontent.com/wvbe/slimdom-sax-parser/deno/src/index.ts';

import { Registry } from './renderer.ts';

function getNode(nodeOrNull: unknown) {
	return nodeOrNull as Node;
}

describe('Registry', () => {
	describe('#add', () => {
		it('throws if a selector is duplicately added', () => {
			const xp = new Registry();
			xp.add('self::a', 1);
			expect(() => xp.add('self::a', 2)).toThrow();
		});
		it('throws if not actually registering a value', () => {
			const xp = new Registry();
			expect(() => xp.add('self::a', undefined)).toThrow();
		});
	});

	describe('#merge', () => {
		it('deduplicates, leaving the latest one in place', () => {
			const xp1 = new Registry();
			xp1.add('self::a', 1);
			xp1.add('self::b', 1);
			const xp2 = new Registry();
			xp2.add('self::a', 2);
			xp2.add('self::c', 2);
			const xp = new Registry(xp1, xp2);
			expect(xp.length).toBe(3);
			expect(xp.find(sync(`<a />`).documentElement as unknown as Node)).toBe(2);
		});
	});

	describe('#overwrite', () => {
		it('overwrites the value associated with an identical selector', () => {
			const xp = new Registry();
			xp.add('self::a', 1);
			xp.overwrite('self::a', 2);
			expect(xp.length).toBe(1);
			expect(xp.find(sync(`<a />`).documentElement as unknown as Node)).toBe(2);
		});
		it('throws if the overwritten value does not exist', () => {
			const xp = new Registry();
			xp.add('self::a', 1);
			expect(() => xp.overwrite('self::b', 1)).toThrow();
			expect(xp.length).toBe(1);
		});
		it('throws if not actually overwriting with a value', () => {
			const xp = new Registry();
			xp.add('self::a', 1);
			expect(() => xp.overwrite('self::a', undefined)).toThrow();
		});
	});

	describe('#find', () => {
		it('returns metadata for the best matching rule', () => {
			const dom = sync(`<x><a /><a foo="bar"/></x>`);
			const xp = new Registry();
			xp.add('self::a', 1);
			xp.add('self::a[@foo]', 2);

			expect(xp.find(getNode(evaluateXPathToFirstNode('//a', dom)))).toBe(1);
			expect(xp.find(getNode(evaluateXPathToFirstNode('//a[@foo]', dom)))).toBe(2);
		});

		it('returns undefined if no metadata found', () => {
			const dom = sync(`<x><a /><a foo="bar"/></x>`);
			const xp = new Registry();

			expect(xp.find(getNode(evaluateXPathToFirstNode('//x', dom)))).toBe(undefined);
		});
	});

	describe('#remove', () => {
		it('returns true if an item was removed', () => {
			const xp = new Registry();
			xp.add('self::a', 1);
			xp.add('self::b', 2);
			expect(xp.length).toBe(2);

			// A valid removal
			expect(xp.remove('self::a')).toBe(true);
			expect(xp.length).toBe(1);

			// A valid removal for any value
			expect(xp.remove('self::b')).toBe(true);
			expect(xp.length).toBe(0);
		});

		it('returns false if an item could not be removed', () => {
			const xp = new Registry();
			xp.add('self::a', 1);
			expect(xp.length).toBe(1);

			// Remove a rule that was never registered
			expect(xp.remove('self::x')).toBe(false);
			expect(xp.length).toBe(1);

			// Remove a rule with a value mismatch
			expect(xp.remove('self::a')).toBe(true);
			expect(xp.length).toBe(0);

			// A valid removal, but repeated too many times
			expect(xp.remove('self::a')).toBe(false);
			expect(xp.length).toBe(0);
		});
	});
});

run();
