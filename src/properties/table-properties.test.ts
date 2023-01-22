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
				<w:end w:val="seattle" w:space="1" w:color="red" />
				<w:bottom w:val="peopleHats" w:sz="8" w:color="red" />
				<w:start w:val="dashed" w:sz="8" w:space="1" />
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
				end: { type: 'seattle', width: null, spacing: 1, color: 'red' },
				bottom: { type: 'peopleHats', width: pt(1), spacing: null, color: 'red' },
				start: { type: 'dashed', width: hpt(2), spacing: 1, color: null },
				insideH: { type: 'heartBalloon', width: twip(20), spacing: 1, color: 'red' },
				insideV: null,
			},
		},
	);

	describe('Legacy schema for cellPadding', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblCellMar>
					<w:left w:w="432" w:type="dxa" />
					<w:right w:w="144" w:type="dxa" />
				</w:tblCellMar>
			</w:tblPr>`,
			{
				cellPadding: {
					top: null,
					bottom: null,
					start: twip(432),
					end: twip(144),
				},
			},
		);
	});

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

	describe('Setting table width to an unannotated value', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblW w:val="420" w:type="nil" />
			</w:tblPr>`,
			{
				width: { length: '420', unit: 'nil' },
			},
		);
	});

	describe('Word 2006-style "left" and "right" borders can still be read', () => {
		test(
			`<w:tblPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:tblBorders>
					<w:left w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
					<w:right w:val="double" w:sz="24" w:space="0" w:color="FF0000"/>
				</w:tblBorders>
			</w:tblPr>`,
			{
				borders: {
					start: {
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
					top: null,
					bottom: null,
					insideH: null,
					insideV: null,
				},
			},
		);
	});
});

run();
