import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';

import { Cell, Paragraph, Row, Table, Text } from '../../../../mod.ts'; // ← your public barrel
import { Archive } from '../../../classes/src/Archive.ts';
import type { ComponentContext } from '../../../classes/src/Component.ts';
import { create, serialize } from '../../../utilities/src/dom.ts';
import { NamespaceUri } from '../../../utilities/src/namespaces.ts';

const date = new Date();
const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Cell-level track-changes (<cellIns>/<cellDel>)', () => {
	const tableNode = create(
		`<w:tbl xmlns:w="${NamespaceUri.w}">
			<w:tr>
				<w:tc>
					<w:tcPr>
						<w:cellDel w:id="2" w:author="Carlos" w:date="${date.toISOString()}"/>
					</w:tcPr>
					<w:p><w:r><w:t xml:space="preserve">Bye!</w:t></w:r></w:p>
				</w:tc>
				<w:tc>
					<w:tcPr>
						<w:cellIns w:id="2" w:author="Carlos" w:date="${date.toISOString()}"/>
					</w:tcPr>
					<w:p><w:r><w:t xml:space="preserve">Hello!</w:t></w:r></w:p>
				</w:tc>
			</w:tr>
		</w:tbl>`,
		emptyContext
	);

	const tableObject = new Table(
		{},
		new Row(
			{},
			new Cell(
				{ deletion: { id: 2, author: 'Carlos', date } },
				new Paragraph({}, new Text({}, 'Bye!'))
			),
			new Cell(
				{ insertion: { id: 2, author: 'Carlos', date } },
				new Paragraph({}, new Text({}, 'Hello!'))
			)
		)
	);

	const tableFromNode = Table.fromNode(tableNode, emptyContext)!;

	it('parses <cellDel>/<cellIns> into cell props', () => {
		const [firstRow] = tableFromNode.children;
		const [delCell, insCell] = firstRow.children as Cell[];

		expect(delCell.props.deletion).toEqual({
			id: 2,
			author: 'Carlos',
			date,
		});
		expect(insCell.props.insertion).toEqual({
			id: 2,
			author: 'Carlos',
			date,
		});
	});

	it('serialises and deserialises correctly', async () => {
		/* what the API generates */
		const generated = serialize(await tableObject.toNode([]));

		/* what we expect – note:
     • default namespace on <tbl>, <tr>, <tc>, …
     • a <tblPr/> skeleton (the renderer always emits one)
     • ns1 / ns2 prefixes only on the change markers */
		const expected = serialize(
			create(
				`<tbl xmlns="${NamespaceUri.w}">
					<tblPr/>
					<tr>
						<tc>
							<tcPr>
								<cellDel xmlns:ns1="${
									NamespaceUri.w
								}" ns1:id="2" ns1:author="Carlos" ns1:date="${date.toISOString()}"/>
							</tcPr>
							<p><r><t xml:space="preserve">Bye!</t></r></p>
						</tc>
						<tc>
							<tcPr>
								<cellIns xmlns:ns2="${
									NamespaceUri.w
								}" ns2:id="2" ns2:author="Carlos" ns2:date="${date.toISOString()}"/>
							</tcPr>
							<p><r><t xml:space="preserve">Hello!</t></r></p>
						</tc>
					</tr>
				</tbl>`
			)
		);

		expect(generated).toEqual(expected);
	});
});
