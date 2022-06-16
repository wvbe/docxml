/** @jsx JSX */

import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { AstNode } from '../types.ts';
import { Document } from '../components/documents.ts';
import { Paragraph } from '../components/paragraphs.ts';
import { Text } from '../components/texts.ts';
import { asArray, getDocxHierarchy, JSX } from './jsx.ts';

describe('asArray()', () => {
	it('Turns a single value into an array of one', async () => {
		expect(await asArray('a')).toEqual(['a']);
		expect(await asArray(null)).toEqual([]);
		expect(await asArray(undefined)).toEqual([]);
	});
	it('Flattens nested/promised arrays', async () => {
		const children = await asArray(['a', ['b'], Promise.resolve(['c']), [Promise.resolve(['d'])]]);
		expect(children).toEqual(['a', 'b', 'c', 'd']);
	});
	it('Filters out null and undefined', async () => {
		const children = await asArray(['a', null, ['b', undefined]]);
		expect(children).toEqual(['a', 'b']);
	});
});

type F = string | F[];
function hierarchyAsArray(nodes: (string | AstNode)[]): F {
	return nodes.map((n) => {
		if (typeof n === 'string') {
			return `"${n}"`;
		}
		return [n.component.type, ...hierarchyAsArray(n.children)];
	});
}

describe('getDocxHierarchy()', () => {
	it('Recoverable', async () => {
		const invalid = await (
			<Paragraph>
				<Text>
					Beep{' '}
					<Text>
						bo
						<Paragraph />
						op
					</Text>{' '}
					baap
				</Text>
			</Paragraph>
		);
		const fixed = getDocxHierarchy(invalid);
		console.log(hierarchyAsArray(fixed));
		expect(fixed).toBe({});
	});
});
run();
