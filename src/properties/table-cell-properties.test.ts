import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { parse } from '../utilities/dom.ts';
import { opt } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import { evaluateXPathToFirstNode } from '../utilities/xquery.ts';
import {
	TableCellProperties,
	tableCellPropertiesFromNode,
	tableCellPropertiesToNode,
} from './table-cell-properties.ts';

const test = createXmlRoundRobinTest<TableCellProperties>(
	tableCellPropertiesFromNode,
	(n: TableCellProperties) => tableCellPropertiesToNode(n, false),
);

describe('Table cell formatting', () => {
	const dom = parse(`<w:tbl ${ALL_NAMESPACE_DECLARATIONS}>
		<w:tblPr>
			<w:tblStyle w:val="TableGrid" />
		</w:tblPr>
		<w:tblGrid>
			<w:gridCol w:w="1701" />
			<w:gridCol w:w="1701" />
			<w:gridCol w:w="1701" />
		</w:tblGrid>
		<w:tr>
			<w:tc id="colspanning-cell">
				<w:tcPr>
					<w:tcW w:w="1701" w:type="dxa" />
					<w:gridSpan w:val="2" />
					<w:shd w:val="pct45" w:color="FFFF00" w:fill="B2A1C7" />
					<w:vMerge w:val="restart" />
					<w:tcBorders>
						<w:top w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:start w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:bottom w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:end w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
						<w:tl2br w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					</w:tcBorders>
				</w:tcPr>
				<w:p>
					<w:pPr />
					<w:r>
						<w:t xml:space="preserve">A1/B1/A2/B2</w:t>
					</w:r>
				</w:p>
			</w:tc>
			<w:tc>
				<w:tcPr>
					<w:tcW w:w="1701" w:type="dxa" />
				</w:tcPr>
				<w:p>
					<w:pPr />
					<w:r>
						<w:t xml:space="preserve">C1</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
		<w:tr>
			<w:tc>
				<w:tcPr>
					<w:tcW w:w="1700.7874015748032" w:type="dxa" />
					<w:gridSpan w:val="2" />
					<w:vMerge w:val="continue" />
				</w:tcPr>
				<w:p />
			</w:tc>
			<w:tc>
				<w:tcPr>
					<w:tcW w:w="1701" w:type="dxa" />
					<w:vMerge w:val="restart" />
				</w:tcPr>
				<w:p>
					<w:pPr />
					<w:r>
						<w:t xml:space="preserve">C2/C3</w:t>
					</w:r>
				</w:p>
			</w:tc>
		</w:tr>
	</w:tbl>
	`);
	test(evaluateXPathToFirstNode(`//*[@id="colspanning-cell"]/w:tcPr`, dom) as Node, {
		colSpan: 2,
		rowSpan: 2,
		shading: {
			background: 'B2A1C7',
			foreground: 'FFFF00',
			pattern: 'pct45',
		},
		borders: {
			top: {
				type: 'double',
				width: opt(24),
				spacing: 0,
				color: 'FF0000',
			},
			start: {
				type: 'double',
				width: opt(24),
				spacing: 0,
				color: 'FF0000',
			},
			bottom: {
				type: 'double',
				width: opt(24),
				spacing: 0,
				color: 'FF0000',
			},
			end: {
				type: 'double',
				width: opt(24),
				spacing: 0,
				color: 'FF0000',
			},
			tl2br: {
				type: 'double',
				width: opt(24),
				spacing: 0,
				color: 'FF0000',
			},
			tr2bl: null,
			insideH: null,
			insideV: null,
		},
	});
});

run();
