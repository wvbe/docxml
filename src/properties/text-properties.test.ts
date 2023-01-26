import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { hpt, twip } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from './text-properties.ts';

const test = createXmlRoundRobinTest<TextProperties>(textPropertiesFromNode, textPropertiesToNode);

describe('Text formatting', () => {
	test(
		`<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:color w:val="red" />
			<w:u w:val="dashLongHeavy" />
			<w:b />
			<w:i />
			<w:smallCaps />
			<w:caps />
			<w:vertAlign w:val="subscript" />
			<w:lang w:val="en-GB" />
			<w:sz w:val="19" />
			<w:kern w:val="23" />
			<w:spacing w:val="100" />
			<w:rFonts w:cs="Tahoma" w:ascii="Arial" w:hAnsi="Courier New" />
		</w:rPr>`,
		{
			color: 'red',
			isUnderlined: 'dashLongHeavy',
			isBold: { simple: true, complex: false },
			isItalic: { simple: true, complex: false },
			isSmallCaps: true,
			isCaps: true,
			verticalAlign: 'subscript',
			language: 'en-GB',
			fontSize: { simple: hpt(19), complex: null },
			minimumKerningFontSize: hpt(23),
			spacing: twip(100),
			font: {
				cs: 'Tahoma',
				ascii: 'Arial',
				hAnsi: 'Courier New',
			},
		},
	);

	describe('Complex character formatting', () => {
		test(
			`<w:rPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:bCs />
				<w:iCs />
				<w:szCs w:val="23" />
			</w:rPr>`,
			{
				isBold: { simple: false, complex: true },
				isItalic: { simple: false, complex: true },
				fontSize: { simple: null, complex: hpt(23) },
			},
		);
	});
});

run();
