import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import Docx from '@fontoxml/docxml';
import { create, serialize } from '../utilities/dom.ts';
import { NamespaceUri } from '../utilities/namespaces.ts';
import { Text } from './Text.ts';
import { TextAddition } from './TextAddition.ts';

describe('Text', () => {
	const timeStamp = new Date();

	it('serializes correctly', async () => {
		const newAddition = new TextAddition(
			{
				id: 1,
				author: 'X',
				date: timeStamp,
			},
			new Text({}, 'Hello')
		);

		const additionNode = await newAddition.toNode([]);

		const newNode = create(
			`<ins xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" 
				ns1:id="1" ns1:author="X" ns1:date="${timeStamp.toISOString()}">
				<r>
					<t xml:space="preserve">Hello</t>
				</r>
            </ins>`
		);

		expect(serialize(additionNode)).toEqual(serialize(newNode));
	});

	it('creates component XML from node', async () => {
		const docxArchive = await Docx.fromNothing().toArchive();
		const date = new Date();
		const newNode = create(
			`<ins xmlns="${NamespaceUri.w}" xmlns:ns1="${
				NamespaceUri.w
			}" xmlns:w="${
				NamespaceUri.w
			}" ns1:author="Y" ns1:id="1" ns1:date="${date.toISOString()}">
				<w:r>
					<w:t xml:space="preserve">Node Test</w:t>
				</w:r>
			</ins>`
		);

		const newAddition = TextAddition.fromNode(newNode, {
			archive: docxArchive,
			relationships: null,
		});

		expect(newAddition.props.author).toBe('Y');
		expect(newAddition.props.date.toISOString()).toEqual(
			date.toISOString()
		);

		expect(serialize(await newAddition.toNode([]))).toBe(
			`<ins xmlns="${NamespaceUri.w}" xmlns:ns1="${NamespaceUri.w}" 
				ns1:id="1" ns1:author="Y" ns1:date="${date.toISOString()}">
				<r>
					<t xml:space="preserve">Node Test</t>
				</r>
			</ins>`.replace(/\t*\n*/gm, '')
		);
	});
});
