import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import { Bookmarks } from '../../../classes/src/Bookmarks.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { RelationshipType } from '../../../enums.ts';
import { RelationshipsXml } from '../../../files/src/RelationshipsXml.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { Hyperlink } from '../src/Hyperlink.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
	bookmarks: new Bookmarks(),
};

describe('Hyperlink', () => {
	const hyperlink = Hyperlink.fromNode(
		create(`
			<w:hyperlink xmlns:w="${NamespaceUri.w}" xmlns:r="${NamespaceUri.r}" r:id="rId1" w:anchor="chapter1" w:tooltip="link">
				<w:r>
					<w:t>Link</w:t>
				</w:r>
				<w:ins w:id="1">
					<w:r>
						<w:t xml:space="preserve">This is a new paragraph</w:t>
					</w:r>
				</w:ins>
				<w:del w:id="1">
					<w:r>
						<w:delText xml:space="preserve">This is removed paragraph</w:delText>
					</w:r>
				</w:del>
			</w:hyperlink>`),
		emptyContext
	);

	it('parses props correctly', () => {
		expect(hyperlink.props.anchor).toBe('chapter1');
		expect(hyperlink.props.tooltip).toBe('link');
		expect(hyperlink.props.relationshipId).toBe('rId1');
	});

	it('parses children correctly', () => {
		expect(hyperlink.children).toHaveLength(3);
	});

	it('serializes correctly', async () => {
		expect(serialize(await hyperlink.toNode([]))).toBe(
			`<hyperlink xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" ns1:anchor="chapter1" ns1:tooltip="link">
				<r><t xml:space="preserve">Link</t></r>
				<ins ns1:id="1">
					<r>
						<t xml:space="preserve">This is a new paragraph</t>
					</r>
				</ins>
				<del ns1:id="1">
					<r>
						<delText xml:space="preserve">This is removed paragraph</delText>
					</r>
				</del>
			</hyperlink>`.replace(/\t|\n/g, '')
		);
	});

	it('resolves url from relationshipId via relationships', () => {
		const relationships = new RelationshipsXml('_rels/.rels', [
			{
				id: 'rId1',
				type: RelationshipType.hyperlink,
				target: 'https://example.com',
				isExternal: true,
				isBinary: false,
			},
		]);
		const context: ComponentContext = {
			archive: new Archive(),
			relationships,
			bookmarks: new Bookmarks(),
		};
		const link = Hyperlink.fromNode(
			create(`
				<w:hyperlink xmlns:w="${NamespaceUri.w}" xmlns:r="${NamespaceUri.r}" r:id="rId1">
					<w:r><w:t>Click</w:t></w:r>
				</w:hyperlink>
			`),
			context
		);
		expect(link.props.url).toBe('https://example.com');
		expect(link.props.relationshipId).toBe('rId1');
	});

	it('does not set url when there is no relationshipId', () => {
		const link = Hyperlink.fromNode(
			create(`
				<w:hyperlink xmlns:w="${NamespaceUri.w}" w:anchor="bookmark1">
					<w:r><w:t>Click</w:t></w:r>
				</w:hyperlink>
			`),
			emptyContext
		);
		expect(link.props.url).toBeFalsy();
		expect(link.props.anchor).toBe('bookmark1');
	});
});
