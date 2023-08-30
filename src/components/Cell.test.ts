import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Cell } from '../../mod.ts';
import { Archive } from '../classes/Archive.ts';
import { ComponentContext } from '../classes/Component.ts';
import { create } from '../utilities/dom.ts';
import { NamespaceUri } from '../utilities/namespaces.ts';
import { evaluateXPathToFirstNode } from '../utilities/xquery.ts';

const emptyContext: ComponentContext = {
	archive: new Archive(),
	relationships: null,
};

describe('Cell', () => {
	const dom = create(`<w:tbl xmlns:w="${NamespaceUri.w}">
		<w:tblGrid>
			<w:gridCol w:w="4319" />
			<w:gridCol w:w="4319" />
		</w:tblGrid>
		<w:tr>
			<w:trPr />
			<w:tc xid="cell-1">
				<w:p>
					<w:r>
						<w:t xml:space="preserve">A 1</w:t>
					</w:r>
				</w:p>
			</w:tc>
			<w:tc xid="cell-2">
				<w:p>
					<w:r>
						<w:t xml:space="preserve">B 1</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
		<w:tr>
			<w:trPr />
			<w:tc xid="cell-3">
				<w:tcPr>
					<w:gridSpan w:val="2" />
				</w:tcPr>
				<w:p>
					<w:r>
						<w:t xml:space="preserve">A+B 2</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
	</w:tbl>`);

	describe('Cell 1', () => {
		const cell = Cell.fromNode(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			evaluateXPathToFirstNode('.//*[@xid="cell-1"]', dom)!,
			emptyContext,
		);
		it('Colspan', () => expect(cell?.props.colSpan).toBe(1));
		it('Rowspan', () => expect(cell?.props.rowSpan).toBe(1));
	});
	describe('Cell 2', () => {
		const cell = Cell.fromNode(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			evaluateXPathToFirstNode('.//*[@xid="cell-2"]', dom)!,
			emptyContext,
		);
		it('Colspan', () => expect(cell?.props.colSpan).toBe(1));
		it('Rowspan', () => expect(cell?.props.rowSpan).toBe(1));
	});
	describe('Cell 3', () => {
		const cell = Cell.fromNode(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			evaluateXPathToFirstNode('.//*[@xid="cell-3"]', dom)!,
			emptyContext,
		);
		it('Colspan', () => expect(cell?.props.colSpan).toBe(2));
		it('Rowspan', () => expect(cell?.props.rowSpan).toBe(1));
	});
});

run();
