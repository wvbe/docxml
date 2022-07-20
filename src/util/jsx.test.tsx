/** @jsx JSX */
import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JSX, Text } from '../../mod.ts';
import { XmlComponent } from '../classes/XmlComponent.ts';

describe('JSX', () => {
	class Comp extends XmlComponent<{ skeet: boolean; boop?: string }> {}
	it('mount a simple XmlComponent', () => {
		// nb; removing the required prop `skeet` should give a TS warning
		expect(<Comp skeet />).toEqual([new Comp({ skeet: true })]);
	});
});

describe('JSX fixing', () => {
	class Bar extends XmlComponent<{ [key: string]: never }, string> {
		static children = [];
		static mixed = true;
	}
	class Foo extends XmlComponent<{ [key: string]: never }, Text | Bar> {
		static children = [Text, Bar];
	}

	it('splits invalid node nesting', () => {
		expect(
			<Foo>
				<Bar>
					a<Bar>b</Bar>c
				</Bar>
			</Foo>,
		).toEqual([new Foo({}, new Bar({}, 'a'), new Bar({}, 'b'), new Bar({}, 'c'))]);
	});

	it('splits invalid node nesting II', () => {
		expect(
			<Bar>
				a<Bar>b</Bar>c
			</Bar>,
		).toEqual([new Bar({}, 'a'), new Bar({}, 'b'), new Bar({}, 'c')]);
	});

	it('wraps stray text nodes in <Text>', () => {
		expect(<Foo>bar</Foo>).toEqual(
			<Foo>
				<Text>bar</Text>
			</Foo>,
		);
		expect(<Foo>bar</Foo>).toEqual([new Foo({}, new Text({}, 'bar'))]);
	});
});

run();
