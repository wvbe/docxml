import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';
import { Table } from '../../document/src/Table.ts';
import { RowAddition } from '../src/RowAddition.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('RowAddition', () => {
	const rowAddition = RowAddition.fromNode(
		create(`
        <w:tr xmlns:w="${NamespaceUri.w}">
            <w:trPr>
            <w:tblHeader/>
            <w:cantSplit/>
            <w:tblCellSpacing w:w="1701" w:type="dxa"/>
                <w:ins w:id="1" w:author="Inés" w:date="2025-06-30T14:25:40.079Z"/>
            </w:trPr>
            <w:tc>
            <w:tcPr/>
            <w:p>
                <w:r>
                <w:t xml:space="preserve"> it is time</w:t>
                </w:r>
            </w:p>
            </w:tc>
        </w:tr>
        `),
		emptyContext
	);

	it('parses props correctly', () => {
		expect(rowAddition.props.id).toBe(1);
		expect(rowAddition.props.author).toBe('Inés');
		expect(rowAddition.props.date).toEqual(
			new Date('2025-06-30T14:25:40.079Z')
		);
		expect(rowAddition.props.cellSpacing).toBeTruthy();
		expect(rowAddition.props.isHeaderRow).toBe(true);
		expect(rowAddition.props.isUnsplittable).toBe(true);
	});

	it('parses children correctly', () => {
		expect(rowAddition.children).toHaveLength(1);
	});

	it('serializes correctly', async () => {
		expect(serialize(await rowAddition.toNode([new Table({})]))).toBe(
			`<tr xmlns="${NamespaceUri.w}">
				<trPr>
					<tblHeader/>
					<cantSplit/>
					<tblCellSpacing xmlns:ns1="${NamespaceUri.w}" ns1:w="1701" ns1:type="dxa"/>
					<ins xmlns:ns2="${NamespaceUri.w}" ns2:id="1" ns2:author="Inés" ns2:date="2025-06-30T14:25:40.079Z"/>
				</trPr>
			</tr>`.replace(/\n|\t/g, '')
		);
	});
});
