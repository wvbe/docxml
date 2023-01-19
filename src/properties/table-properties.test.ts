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
			<w:tblCellMar>
				<w:top w:w="720" w:type="dxa" />
				<w:start w:w="432" w:type="dxa" />
				<w:bottom w:w="0" w:type="dxa" />
				<w:end w:w="144" w:type="dxa" />
			</w:tblCellMar>
			<w:tblBorders>
				<w:top w:sz="8" w:space="1" w:color="red" />
				<w:right w:val="seattle" w:space="1" w:color="red" />
				<w:bottom w:val="peopleHats" w:sz="8" w:color="red" />
				<w:left w:val="dashed" w:sz="8" w:space="1" />
				<w:insideH w:val="heartBalloon" w:sz="8" w:space="1" w:color="red" />
			</w:tblBorders>
			<w:tblInd w:w="100" w:type="dxa" />
			<w:tblCellSpacing w:w="60" w:type="dxa" />
			<w:tblStyleRowBandSize w:val="2" />
			<w:tblStyleColBandSize w:val="3" />
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
			indentation: pt(5),
			cellSpacing: pt(3),
			cellPadding: {
				top: twip(720),
				bottom: twip(0),
				start: twip(432),
				end: twip(144),
			},
			rowBandingSize: 2,
			columnBandingSize: 3,
			borders: {
				top: { type: null, width: opt(8), spacing: 1, color: 'red' },
				right: { type: 'seattle', width: null, spacing: 1, color: 'red' },
				bottom: { type: 'peopleHats', width: pt(1), spacing: null, color: 'red' },
				left: { type: 'dashed', width: hpt(2), spacing: 1, color: null },
				insideH: { type: 'heartBalloon', width: twip(20), spacing: 1, color: 'red' },
				insideV: null,
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
