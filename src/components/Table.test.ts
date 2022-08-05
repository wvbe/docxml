/** @jsx JSX */

import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Table } from '../../mod.ts';
import { create } from '../utilities/dom.ts';
import { NamespaceUri } from '../utilities/namespaces.ts';

describe('Table', () => {
	//    +---------+----+
	//    |0        |1   |
	//    |         +----+
	//    |         |2   |
	//    +---------+    |
	//    |3        |    |
	//    +---------+----+
	const table = Table.fromNode(
		create(`
			<w:tbl xmlns:w="${NamespaceUri.w}">
				<w:tr>
					<w:tc>
						<w:tcPr>
							<w:gridSpan w:val="2" />
							<w:vMerge w:val="restart" />
						</w:tcPr>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">A1/B1/A2/B2</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">C1</w:t>
							</w:r>
						</w:p>
					</w:tc>
				</w:tr>
				<w:tr>
					<w:tc>
						<w:tcPr>
							<w:gridSpan w:val="2" />
							<w:vMerge w:val="continue" />
						</w:tcPr>
						<w:p />
					</w:tc>
					<w:tc>
						<w:tcPr>
							<w:vMerge w:val="restart" />
						</w:tcPr>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">C2/C3</w:t>
							</w:r>
						</w:p>
					</w:tc>
				</w:tr>
				<w:tr>
					<w:tc>
						<w:tcPr>
							<w:gridSpan w:val="2" />
						</w:tcPr>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">A3/B3</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:tcPr>
							<w:vMerge w:val="continue" />
						</w:tcPr>
						<w:p />
					</w:tc>
				</w:tr>
				<w:tr>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">A4</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">B4</w:t>
							</w:r>
						</w:p>
					</w:tc>
					<w:tc>
						<w:p>
							<w:pPr>
								<w:rPr />
							</w:pPr>
							<w:r>
								<w:rPr />
								<w:t xml:space="preserve">C4</w:t>
							</w:r>
						</w:p>
					</w:tc>
				</w:tr>
			</w:tbl>
		`),
	);

	it('Row 0 has the correct amount of cells', () =>
		expect(table.children[0].children).toHaveLength(2));

	it('Row 1 has the correct amount of cells', () =>
		expect(table.children[1].children).toHaveLength(1));

	it('Row 2 has the correct amount of cells', () =>
		expect(table.children[2].children).toHaveLength(1));

	it('Cell 0 (rowspan and colspan) is parsed correctly', () => {
		const cell = table.children[0].children[0];
		expect(cell.props.colSpan).toBe(2);
		expect(cell.props.rowSpan).toBe(2);
		expect(cell.children).toHaveLength(1);
	});

	it('Cell 1 (no spans) is parsed correctly', () => {
		const cell = table.children[0].children[1];
		expect(cell.props.colSpan).toBe(1);
		expect(cell.props.rowSpan).toBe(1);
		expect(cell.children).toHaveLength(1);
	});

	it('Cell 2 (rowspan) is parsed correctly', () => {
		const cell = table.children[1].children[0];
		expect(cell.props.colSpan).toBe(1);
		expect(cell.props.rowSpan).toBe(2);
		expect(cell.children).toHaveLength(1);
	});

	it('Cell 3 (colspan) is parsed correctly', () => {
		const cell = table.children[2].children[0];
		expect(cell.props.colSpan).toBe(2);
		expect(cell.props.rowSpan).toBe(1);
		expect(cell.children).toHaveLength(1);
	});
});

run();
