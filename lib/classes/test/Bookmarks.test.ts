import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Bookmarks } from '../src/Bookmarks.ts';

describe('Bookmarks', () => {
	describe('get', () => {
		it('returns the bookmark name by its identifier', () => {
			const bookmarks = new Bookmarks();
			bookmarks.registerIdentifier(1, 'chapter1');
			expect(bookmarks.get(1)).toBe('chapter1');
		});

		it('returns null when registered without a name', () => {
			const bookmarks = new Bookmarks();
			bookmarks.registerIdentifier(5);
			expect(bookmarks.get(5)).toBeNull();
		});

		it('returns undefined for an unregistered identifier', () => {
			const bookmarks = new Bookmarks();
			expect(bookmarks.get(999)).toBeUndefined();
		});
	});

	describe('create', () => {
		it('creates a bookmark with an auto-generated name', () => {
			const bookmarks = new Bookmarks();
			const bookmark = bookmarks.create();
			expect(bookmark.id).toBe(0);
			expect(bookmark.name).toBe('__docxml_bookmark_0');
		});

		it('skips identifiers that are already taken', () => {
			const bookmarks = new Bookmarks();
			bookmarks.registerIdentifier(0, 'existing');
			const bookmark = bookmarks.create();
			expect(bookmark.id).toBe(1);
		});

		it('makes created bookmarks retrievable via get (name not stored)', () => {
			const bookmarks = new Bookmarks();
			const bookmark = bookmarks.create();
			// create() calls registerIdentifier(id) without a name, so get() returns null
			expect(bookmarks.get(bookmark.id)).toBeNull();
		});
	});

	describe('registerIdentifier', () => {
		it('throws when registering a duplicate identifier', () => {
			const bookmarks = new Bookmarks();
			bookmarks.registerIdentifier(1, 'first');
			expect(() => bookmarks.registerIdentifier(1, 'second')).toThrow(
				'Bookmark with identifier "1" already exists.'
			);
		});
	});
});
