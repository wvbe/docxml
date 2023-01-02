import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { parse, serialize } from '../utilities/dom.ts';
import { Numbering } from './Numbering.ts';

describe('Numbering', () => {
	const numbering = Numbering.fromNode(
		parse(`
			<numbering xmlns="http://schemas.openxmlformats.org/wordprocessingml/2006/main" />
		`),
		'',
	);

	it('serializes correctly as an empty file', async () => {
		expect(serialize(await numbering.$$$toNode())).toBe(
			`<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"/>`,
		);
	});

	it('serializes correctly with an abstract numbering', async () => {
		numbering.addAbstract({
			id: 0,
			type: 'hybridMultilevel',
			levels: [
				{
					alignment: 'left',
					format: 'decimal',
					start: 3,
					text: '%1.',
				},
			],
		});
		expect(serialize(await numbering.$$$toNode())).toBe(
			`<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:abstractNum w:abstractNumId="0">
					<w:multiLevelType w:val="hybridMultilevel"/>
					<w:lvl w:ilvl="0">
						<w:start w:val="3"/>
						<w:numFmt w:val="decimal"/>
						<w:lvlText w:val="%1."/>
						<w:lvlJc w:val="left"/>
					</w:lvl>
				</w:abstractNum>
			</w:numbering>`.replace(/\t|\n/g, ''),
		);
	});

	it('serializes correctly with an concrete numbering', async () => {
		numbering.add(0);
		expect(serialize(await numbering.$$$toNode())).toBe(
			`<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
				<w:abstractNum w:abstractNumId="0">
					<w:multiLevelType w:val="hybridMultilevel"/>
					<w:lvl w:ilvl="0">
						<w:start w:val="3"/>
						<w:numFmt w:val="decimal"/>
						<w:lvlText w:val="%1."/>
						<w:lvlJc w:val="left"/>
					</w:lvl>
				</w:abstractNum>
				<w:num w:numId="0">
					<w:abstractNumId w:val="0"/>
				</w:num>
			</w:numbering>`.replace(/\t|\n/g, ''),
		);
	});

	it('can parse', async () => {
		const num = Numbering.fromNode(parse(serialize(await numbering.$$$toNode())), '');
		expect(num).toEqual(numbering);
	});
});

run();
