import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Text, TextDeletion } from '../../../../mod.ts';
import { Docx } from '../../../Docx.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';

describe('Text', () => {
	const timeStamp = new Date();

	it('serializes correctly', async () => {
		const newDeletion = new TextDeletion(
			{
				id: 1,
				author: 'X',
				date: timeStamp,
			},
			new Text({}, 'Hello')
		);

		const deletionNode = await newDeletion.toNode([]);

		const newNode = create(
			`<del xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" 
				ns1:id="1" ns1:author="X" ns1:date="${timeStamp.toISOString()}">
				<r>
					<delText xml:space="preserve">Hello</delText>
				</r>
			</del>`
		);

		expect(serialize(deletionNode)).toEqual(serialize(newNode));
	});

	it('creates component XML from node', async () => {
		const docxArchive = await Docx.fromNothing().toArchive();
		const date = new Date();
		const newNode = create(
			`<del xmlns="${NamespaceUri.w}" xmlns:w="${
				NamespaceUri.w
			}" xmlns:ns1="${NamespaceUri.w}" 
			ns1:author="Y" ns1:id="1" ns1:date="${date.toISOString()}">
				<w:r>
					<w:delText xml:space="preserve">Node Test</w:delText>
				</w:r>
			</del>`
		);

		const newDeletion = TextDeletion.fromNode(newNode, {
			archive: docxArchive,
			relationships: null,
		});

		expect(newDeletion.props.author).toBe('Y');

		expect(newDeletion.props.date?.toISOString()).toEqual(
			date.toISOString()
		);

		// Re-serialize our node to make sure we get the right thing back.
		expect(serialize(await newDeletion.toNode([]))).toBe(
			`<del xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" 
				ns1:id="1" ns1:author="Y" ns1:date="${date.toISOString()}">
				<r>
					<delText xml:space="preserve">Node Test</delText>
				</r>
			</del>`.replace(/\t*\n*/gm, '')
		);
	});
});
