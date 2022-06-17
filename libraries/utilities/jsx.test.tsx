/** @jsx JSX */

import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Paragraph } from '../components/paragraphs.ts';
import { Section } from '../components/sections.ts';
import { Text } from '../components/texts.ts';
import {
	bumpInvalidChildrenToAncestry,
	ensureFlatResolvedArray,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	JSX,
} from './jsx.ts';

describe('ensureFlatResolvedArray()', () => {
	it('Turns a single value into an array of one', async () => {
		expect(await ensureFlatResolvedArray('a')).toEqual(['a']);
		expect(await ensureFlatResolvedArray(null)).toEqual([]);
		expect(await ensureFlatResolvedArray(undefined)).toEqual([]);
	});
	it('Flattens nested/promised arrays', async () => {
		const children = await ensureFlatResolvedArray([
			'a',
			['b'],
			Promise.resolve(['c']),
			[Promise.resolve(['d'])],
		]);
		expect(children).toEqual(['a', 'b', 'c', 'd']);
	});
	it('Filters out null and undefined', async () => {
		const children = await ensureFlatResolvedArray(['a', null, ['b', undefined]]);
		expect(children).toEqual(['a', 'b']);
	});
});

describe('bumpInvalidChildrenToAncestry()', () => {
	it('Simple splitting', async () => {
		const invalid = await (
			<Paragraph>
				<Text>
					A<Text>B</Text>C
				</Text>
			</Paragraph>
		);
		expect(bumpInvalidChildrenToAncestry(invalid)).toEqual(
			await (
				<Paragraph>
					<Text>A</Text>
					<Text>B</Text>
					<Text>C</Text>
				</Paragraph>
			),
		);
	});
	it('Splitting multiple levels', async () => {
		const invalid = await (
			<Section>
				<Paragraph>
					<Text>
						A
						<Text>
							B<Paragraph />C
						</Text>
						D
					</Text>
				</Paragraph>
			</Section>
		);
		expect(bumpInvalidChildrenToAncestry(invalid)).toEqual(
			await (
				<Section>
					<Paragraph>
						<Text>A</Text>
						<Text>B</Text>
						<Text />
					</Paragraph>
					<Paragraph />
					<Paragraph>
						<Text />
						<Text>C</Text>
						<Text>D</Text>
					</Paragraph>
				</Section>
			),
		);
	});
	it('Unrecoverable nesting error', async () => {
		const invalid = await (
			<Text>
				<Paragraph />
			</Text>
		);
		expect(() => bumpInvalidChildrenToAncestry(invalid)).toThrow(
			'Some AST nodes could not be given a valid position',
		);
	});
});

run();
