import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { hpt } from '../utilities/length.ts';
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
			<w:vertAlign w:val="subscript" />
			<w:lang w:val="en-GB" />
			<w:sz w:val="19" />
		</w:rPr>`,
		{
			color: 'red',
			isUnderlined: 'dashLongHeavy',
			isBold: true,
			isItalic: true,
			isSmallCaps: true,
			verticalAlign: 'subscript',
			language: 'en-GB',
			fontSize: hpt(19),
		},
	);
});

run();
