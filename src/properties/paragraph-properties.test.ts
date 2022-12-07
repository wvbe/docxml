import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { hpt, twip } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from './paragraph-properties.ts';
import { type TextProperties } from './text-properties.ts';

const test = createXmlRoundRobinTest<ParagraphProperties & TextProperties>(
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
);

describe('Paragraph formatting', () => {
	test(
		`<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pStyle w:val="Header" />
			<w:spacing w:after="200" w:line="276" w:lineRule="auto" />
			<w:outlineLvl w:val="3" />
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

			language: 'en-GB',
			outlineLvl: 3,
			isBold: true,
			isItalic: true,
			verticalAlign: 'subscript',
			spacing: {
				before: null,
				after: twip(200),
				line: twip(276),
				lineRule: 'auto',
				afterAutoSpacing: null,
				beforeAutoSpacing: null,
			},
			fontSize: hpt(19),
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
});

run();
