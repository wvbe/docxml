import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import { Bookmarks } from '../../../classes/src/Bookmarks.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { BookmarkRangeStart } from '../src/BookmarkRangeStart.ts';

describe('BookmarkRangeStart', () => {
	it('parses id and name from XML', () => {
		const bookmarks = new Bookmarks();
		const context: ComponentContext = {
			archive: new Archive(),
			relationships: null,
			bookmarks,
		};
		const node = create(`
			<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="3" w:name="my_bookmark" />
		`);
		const component = BookmarkRangeStart.fromNode(node, context);
		expect(component.props.id).toBe(3);
		expect(component.props.name).toBe('my_bookmark');
	});

	it('registers the bookmark in the context during parsing', () => {
		const bookmarks = new Bookmarks();
		const context: ComponentContext = {
			archive: new Archive(),
			relationships: null,
			bookmarks,
		};
		const node = create(`
			<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="7" w:name="chapter1" />
		`);
		BookmarkRangeStart.fromNode(node, context);
		expect(bookmarks.get(7)).toBe('chapter1');
	});

	it('registers multiple bookmarks in the same context', () => {
		const bookmarks = new Bookmarks();
		const context: ComponentContext = {
			archive: new Archive(),
			relationships: null,
			bookmarks,
		};
		BookmarkRangeStart.fromNode(
			create(
				`<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="0" w:name="intro" />`
			),
			context
		);
		BookmarkRangeStart.fromNode(
			create(
				`<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="1" w:name="chapter1" />`
			),
			context
		);
		BookmarkRangeStart.fromNode(
			create(
				`<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="2" w:name="chapter2" />`
			),
			context
		);
		expect(bookmarks.get(0)).toBe('intro');
		expect(bookmarks.get(1)).toBe('chapter1');
		expect(bookmarks.get(2)).toBe('chapter2');
	});

	it('throws when parsing a duplicate bookmark id', () => {
		const bookmarks = new Bookmarks();
		bookmarks.registerIdentifier(5, 'existing');
		const context: ComponentContext = {
			archive: new Archive(),
			relationships: null,
			bookmarks,
		};
		const node = create(`
			<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="5" w:name="duplicate" />
		`);
		expect(() => BookmarkRangeStart.fromNode(node, context)).toThrow(
			'Bookmark with identifier "5" already exists.'
		);
	});

	it('serializes back to XML correctly', () => {
		const bookmarks = new Bookmarks();
		const context: ComponentContext = {
			archive: new Archive(),
			relationships: null,
			bookmarks,
		};
		const node = create(`
			<w:bookmarkStart xmlns:w="${NamespaceUri.w}" w:id="1" w:name="test_bm" />
		`);
		const component = BookmarkRangeStart.fromNode(node, context);
		const output = serialize(component.toNode([]));
		expect(output).toContain('id="1"');
		expect(output).toContain('name="test_bm"');
	});
});
