import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { create } from '../util/dom.ts';
import { hpt, twip } from '../util/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../util/namespaces.ts';
import { Ppr, PprI } from './ppr.ts';

describe('Paragraph formatting', () => {
	const parsedOnce = Ppr.fromNode(
		create(`
			<w:pPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:pStyle w:val="Header" />
				<w:spacing w:after="200" w:line="276" w:lineRule="auto" />
				<w:rPr>
					<w:b />
					<w:vertAlign w:val="subscript" />
					<w:i />
					<w:lang w:val="en-GB" />
					<w:sz w:val="19" />
				</w:rPr>
			</w:pPr>
		`),
	);

	const hardcodedExpectation: PprI = {
		alignment: null,
		style: 'Header',
		language: 'en-GB',
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
	};

	const parsedTwice = Ppr.fromNode(Ppr.toNode(parsedOnce));
	(Object.keys(hardcodedExpectation) as Array<keyof PprI>).forEach((prop) => {
		it(prop, () => {
			expect(parsedOnce[prop]).toEqual(parsedTwice[prop]);
			// ps: The prop could fail to parse in the same way twice

			expect(parsedOnce[prop]).toEqual(hardcodedExpectation[prop]);
		});
	});
});

run();
