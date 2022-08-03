/** @jsx JSX */
import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JSX, Text } from '../../mod.ts';
import { Component } from '../classes/Component.ts';

describe('JSX', () => {
	class Comp extends Component<{ skeet: boolean; boop?: string }> {}
	it('mount a simple Component', () => {
		// nb; removing the required prop `skeet` should give a TS warning
		expect(<Comp skeet />).toEqual([new Comp({ skeet: true })]);
	});
});

describe('JSX fixing', () => {
	class Bar extends Component<{ [key: string]: never }, string> {
		static children = [];
		static mixed = true;
	}

	class Foo extends Component<{ [key: string]: never }, Text | Bar> {
		static children = [Text.name, Bar.name];
		static false = true;
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

	it('cleans up empty <Text>', () => {
		expect(
			<Text>
				<Text>bar</Text>
			</Text>,
		).toEqual(<Text>bar</Text>);
	});

	it('inherits formatting options onto <Text>', () => {
		expect(
			<Foo>
				<Text isItalic isBold>
					Beep
					{
						// JSX Keep this text node
						' '
					}
					<Text>boop</Text>
					{
						// JSX Keep this text node
						' '
					}
					baap
				</Text>
			</Foo>,
		).toEqual(
			<Foo>
				<Text isItalic isBold>
					Beep{' '}
				</Text>
				<Text isItalic isBold>
					boop
				</Text>
				<Text isItalic isBold>
					{' '}
					baap
				</Text>
			</Foo>,
		);
	});
});

run();
