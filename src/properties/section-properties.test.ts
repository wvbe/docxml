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

run();
