import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { RowDeletion } from '../../mod.ts';
import { Archive } from '../classes/Archive.ts';
import type { ComponentContext } from '../classes/Component.ts';
import { create, serialize } from '../utilities/dom.ts';
import { NamespaceUri } from '../utilities/namespaces.ts';
import { Table } from './Table.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('RowDeletion', () => {
	const rowDeletion = RowDeletion.fromNode(
		create(`
            <w:tr xmlns:w="${NamespaceUri.w}">
                <w:trPr>
                    <w:del w:id="2" w:author="Inés" w:date="2025-06-30T14:25:40.079Z"/>
                </w:trPr>
                <w:tc>
                <w:tcPr/>
                <w:p>
                    <w:r>
                    <w:t xml:space="preserve"> sunlight comes</w:t>
                    </w:r>
                </w:p>
                </w:tc>
            </w:tr>
        `),
		emptyContext
	);

	it('parses props correctly', () => {
		expect(rowDeletion.props.id).toBe(2);
		expect(rowDeletion.props.author).toBe('Inés');
		expect(rowDeletion.props.date).toEqual(
			new Date('2025-06-30T14:25:40.079Z')
		);
		expect(rowDeletion.props.cellSpacing).toBeFalsy();
		expect(rowDeletion.props.isHeaderRow).toBe(false);
		expect(rowDeletion.props.isUnsplittable).toBe(false);
	});

	it('parses children correctly', () => {
		expect(rowDeletion.children).toHaveLength(1);
	});

	it('serializes correctly', async () => {
		expect(serialize(await rowDeletion.toNode([new Table({})]))).toBe(
			`<tr xmlns="${NamespaceUri.w}">
				<trPr>
					<del xmlns:ns1="${NamespaceUri.w}" ns1:id="2" ns1:author="Inés" ns1:date="2025-06-30T14:25:40.079Z"/>
				</trPr>
			</tr>`.replace(/\n|\t/g, '')
		);
	});
});
