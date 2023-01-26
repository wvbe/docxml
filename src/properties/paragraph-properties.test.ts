import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { hpt, pt, twip } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from './paragraph-properties.ts';

const test = createXmlRoundRobinTest<ParagraphProperties>(
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
);

describe('Paragraph formatting', () => {
	test(
		`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pStyle w:val="Header" />
			<w:spacing w:after="200" w:line="276" w:lineRule="auto" />
			<w:outlineLvl w:val="3" />
			<w:shd w:val="pct45" w:color="FFFF00" w:fill="B2A1C7" />
			<w:ind w:start="1440" w:end="1440" />
			<w:pBdr>
				<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />
			</w:pBdr>
			<w:rPr>
				<w:b />
				<w:vertAlign w:val="subscript" />
				<w:i />
				<w:lang w:val="en-GB" />
				<w:sz w:val="19" />
			</w:rPr>
		</w:pPr>`,
		{
			alignment: null,

			// This test fails due to a naming collision with the "style" property on TextProperties
			style: 'Header',

			shading: {
				background: 'B2A1C7',
				foreground: 'FFFF00',
				pattern: 'pct45',
			},
			outlineLvl: 3,
			indentation: {
				start: twip(1440),
				end: twip(1440),
				startChars: null,
				endChars: null,
				hanging: null,
				hangingChars: null,
				firstLine: null,
				firstLineChars: null,
			},
			spacing: {
				before: null,
				after: twip(200),
				line: twip(276),
				lineRule: 'auto',
				afterAutoSpacing: false,
				beforeAutoSpacing: false,
			},
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
			pilcrow: {
				isBold: { simple: true },
				isItalic: { simple: true },
				verticalAlign: 'subscript',
				language: 'en-GB',
				fontSize: { simple: hpt(19) },
			},
		},
	);

	describe('Paragraph style with "zero" outline level', () => {
		test(
			`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:outlineLvl w:val="0" />
			</w:pPr>`,
			{
				outlineLvl: 0,
			},
		);
	});

	describe('Legacy "left"/"right"', () => {
		test(
			`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:ind w:left="1440" w:right="1440" />
			</w:pPr>`,
			{
				indentation: {
					start: twip(1440),
					end: twip(1440),
				},
			},
		);
	});
});

run();
