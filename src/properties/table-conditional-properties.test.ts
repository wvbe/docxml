import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { opt, pt } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	TableConditionalProperties,
	tableConditionalPropertiesFromNode,
	tableConditionalPropertiesToNode,
} from './table-conditional-properties.ts';

const test = createXmlRoundRobinTest<TableConditionalProperties>(
	(x) => tableConditionalPropertiesFromNode(x as NonNullable<typeof x>),
	tableConditionalPropertiesToNode,
);

describe('Table conditional formatting', () => {
	test(
		`<w:tblStylePr ${ALL_NAMESPACE_DECLARATIONS} w:type="wholeTable">
			<w:pPr>
				<w:pBdr>
					<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />
				</w:pBdr>
			</w:pPr>
			<w:rPr>
				<w:b />
			</w:rPr>
			<w:tblPr>
				<w:tblBorders>
					<w:top w:sz="8" w:space="1" w:color="red" />
				</w:tblBorders>
			</w:tblPr>
			<w:tcPr>
				<w:tcW w:w="1701" w:type="dxa" />
				<w:tcBorders>
					<w:top w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:start w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:bottom w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:end w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:tl2br w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
				</w:tcBorders>
			</w:tcPr>
		</w:tblStylePr>`,
		{
			type: 'wholeTable',
			paragraph: {
				alignment: null,
				outlineLvl: null,
				style: null,
				spacing: null,
				indentation: null,
				shading: null,
				borders: {
					top: {
						type: 'single',
						width: pt(3),
						spacing: 1,
						color: 'FF0000',
					},
					left: null,
					bottom: null,
					right: null,
					between: null,
				},
				listItem: null,
			},
			text: {
				style: null,
				color: null,
				isUnderlined: null,
				isBold: true,
				isItalic: false,
				isSmallCaps: false,
				isCaps: false,
				verticalAlign: null,
				language: null,
				fontSize: null,
				minimumKerningFontSize: null,
				isStrike: false,
				spacing: null,
				font: null,
			},
			table: {
				style: null,
				activeConditions: null,
				indentation: null,
				cellSpacing: null,
				cellPadding: null,
				borders: {
					top: {
						type: null,
						width: pt(1),
						spacing: 1,
						color: 'red',
					},
					start: null,
					bottom: null,
					end: null,
					insideH: null,
					insideV: null,
				},
				width: null,
				columnBandingSize: null,
				rowBandingSize: null,
			},
			cell: {
				colSpan: 1,
				rowSpan: 1,
				shading: null,
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
			},
		},
	);
});

run();
