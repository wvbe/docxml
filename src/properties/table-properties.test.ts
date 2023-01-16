import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { hpt, opt, pt, twip } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from './table-properties.ts';

const test = createXmlRoundRobinTest<TableProperties>(
	tablePropertiesFromNode,
	tablePropertiesToNode,
);

describe('Table formatting', () => {
	test(
		`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:tblStyle w:val="afkicken-van-de-opkikkers" />
			<w:tblW w:val="1200" w:type="dxa" />
			<w:tblLook
				w:firstColumn="1"
				w:firstRow="1"
				w:lastColumn="1"
				w:lastRow="1"
				w:noHBand="1"
				w:noVBand="1"
			/>
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
			<w:tblBorders>
				<w:top w:sz="8" w:space="1" w:color="red" />
				<w:right w:val="seattle" w:space="1" w:color="red" />
				<w:bottom w:val="peopleHats" w:sz="8" w:color="red" />
				<w:left w:val="dashed" w:sz="8" w:space="1" />
				<w:insideH w:val="heartBalloon" w:sz="8" w:space="1" w:color="red" />
			</w:tblBorders>
		</w:tblPr>`,
		{
			style: 'afkicken-van-de-opkikkers',
			width: { length: '1200', unit: 'dxa' },
			look: {
				firstColumn: true,
				firstRow: true,
				lastColumn: true,
				lastRow: true,
				noHBand: true,
				noVBand: true,
			},
			borders: {
				top: { type: null, width: opt(8), spacing: 1, color: 'red' },
				right: { type: 'seattle', width: null, spacing: 1, color: 'red' },
				bottom: { type: 'peopleHats', width: pt(1), spacing: null, color: 'red' },
				left: { type: 'dashed', width: hpt(2), spacing: 1, color: null },
				insideH: { type: 'heartBalloon', width: twip(20), spacing: 1, color: 'red' },
				insideV: null,
			},
			cells: {
				colSpan: 1,
				rowSpan: 1,
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

	describe('Setting table width to a "%" string', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblW w:val="100%" w:type="nil" />
			</w:tblPr>`,
			{
				width: { length: '100%', unit: 'nil' },
			},
		);
	});

	describe('Setting table width to a "%" string', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblW w:val="420" w:type="nil" />
			</w:tblPr>`,
			{
				width: { length: '420', unit: 'nil' },
			},
		);
	});
});

run();
