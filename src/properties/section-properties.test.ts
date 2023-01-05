import { describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { twip } from '../utilities/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { createXmlRoundRobinTest } from '../utilities/tests.ts';
import {
	SectionProperties,
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
} from './section-properties.ts';

const test = createXmlRoundRobinTest<SectionProperties>(
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
);

describe('Section formatting', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pgSz
				w:w="1200"
				w:h="1600"
				w:orient="landscape"
			/>
		</w:sectPr>`,
		{
			pageWidth: twip(1200),
			pageHeight: twip(1600),
			pageOrientation: 'landscape',
		},
	);
});

describe('Section header/footer references', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:headerReference r:id="test1" w:type="default" />
			<w:headerReference r:id="test2" w:type="first" />
			<w:headerReference r:id="test3" w:type="even" />
		</w:sectPr>`,
		{
			headers: {
				first: 'test2',
				even: 'test3',
				odd: 'test1',
			},
			footers: {
				first: null,
				even: null,
				odd: null,
			},
		},
	);
});

run();
