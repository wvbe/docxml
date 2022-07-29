/** @jsx API.JSX */

import API, {
	Break,
	Cell,
	Document,
	Paragraph,
	Row,
	Table,
	Text,
	TextAddition,
	TextDeletion,
} from './mod.ts';

const api = new API();

api.styles.add({
	id: 'Normal',
	type: 'paragraph',
	name: 'Normal',
	paragraphProperties: {
		spacing: {
			before: 150,
			after: 150,
		},
	},
});

const $skeet = api.styles.add({
	type: 'paragraph',
	name: 'Skeet of the boop',
	paragraphProperties: {
		alignment: 'right',
	},
	textProperties: {
		isItalic: true,
		isBold: true,
	},
});

api.styles.add({
	id: 'TableGrid',
	type: 'table',
	name: 'Table Grid',
	basedOn: 'TableNormal',
	isDefault: null,
	paragraphProperties: { change: null },
	textProperties: {},
	tableProperties: {
		style: null,
		look: null,
		borders: {
			left: { type: 'single', spacing: 0, width: 4, color: 'auto' },
			right: { type: 'single', spacing: 0, width: 4, color: 'auto' },
			top: { type: 'single', spacing: 0, width: 4, color: 'auto' },
			bottom: { type: 'single', spacing: 0, width: 4, color: 'auto' },
			insideH: { type: 'single', spacing: 0, width: 4, color: 'auto' },
			insideV: { type: 'single', spacing: 0, width: 4, color: 'auto' },
		},
	},
});
api.document.set(
	<Document>
		<Paragraph>
			<Text>
				This is the first paragraph of a test document, and it is the only paragraph devoid of all
				styling. Notice that it still has spacing around it, because the "Normal" paragraph template
				is overwritten in this test.
			</Text>
		</Paragraph>
		<Paragraph>
			<Text isItalic>This document was generated at:</Text>
			<Text isBold>{' ' + new Date().toISOString()}</Text>
		</Paragraph>
		<Paragraph isBold isItalic>
			The text in this paragraph is unstyled, but it's pilcrow sign (you can display it by enabling
			the "¶" toolbar button) is bold and italic.
		</Paragraph>
		<Paragraph alignment="center" spacing={{ before: 96 * 20, after: 96 * 20 }}>
			This text is center aligned, and the paragraph is given a lot of space before/after it
		</Paragraph>
		<Paragraph>
			This paragraph has no styles, but the text in it is <Text isBold>bold</Text>,{' '}
			<Text isItalic>italic</Text>, <Text verticalAlign={'superscript'}>superscript</Text>,{' '}
			<Text verticalAlign={'subscript'}>subscript</Text>,{' '}
			<Text verticalAlign={'baseline'}>baseline</Text> or{' '}
			<Text isSmallCaps>small capital letters</Text>.
		</Paragraph>
		<Paragraph>
			Could use <Text color="red">different</Text> <Text color="#0000FF">colors</Text> or{' '}
			<Text isUnderlined>different</Text> <Text isUnderlined="dashDotDotHeavy">kinds</Text>{' '}
			<Text isUnderlined="wave">underline</Text> <Text isUnderlined="double">underline</Text>
		</Paragraph>
		<Paragraph style={$skeet}>
			This is a paragraph with a named style "skeet", shown in UI as "Skeet of the boop".
		</Paragraph>
		<Paragraph />
		<Paragraph change={{ id: 0, author: 'Wybe', date: new Date(), style: $skeet }}>
			This paragraph went from "Skeet of the boop" to being a normal paragraph.
		</Paragraph>
		<Paragraph />
		<Paragraph style={$skeet} change={{ id: 0, author: 'Hans Pannekoek', date: new Date() }}>
			This paragraph went from a normal paragraph to "Skeet of the boop".
		</Paragraph>
		<Paragraph>
			This paragraph has{' '}
			<TextAddition author={'Wybe the Builder'} date={new Date()} id={5}>
				additions
			</TextAddition>
			<TextDeletion author={'Wybe the Destroyer'} date={new Date()} id={6}>
				{' '}
				and removals
			</TextDeletion>
			.
		</Paragraph>
		<Paragraph>
			Some{' '}
			<TextAddition author={'Wybe the Formatter'} date={new Date()} id={7} isBold>
				additions
			</TextAddition>{' '}
			and{' '}
			<TextDeletion author={'Wybe the Formatter'} date={new Date()} id={8} isItalic>
				removals
			</TextDeletion>
			each with their own inline formatting
		</Paragraph>
		<Paragraph>
			<Text>
				There are two
				<Break />
				line breaks
				<Break type="textWrapping" />
				in this paragraph
			</Text>
		</Paragraph>
		<Paragraph
			indentation={{
				left: 24 * 20,
				firstLine: 48 * 20,
			}}
			alignment="both"
		>
			This is a paragraph with indentation, and more indentation on the first line. This is a
			paragraph with indentation, and more indentation on the first line. This is a paragraph with
			indentation, and more indentation on the first line. This is a paragraph with indentation, and
			more indentation on the first line.
		</Paragraph>
		<Table
			style="TableGrid"
			borders={{ top: { type: 'wave' } }}
			columnWidths={[4500, 4500]}
			// @TODO make this work, fuksake
			// width={{ length: 0, unit: 'auto' }}
		>
			<Row>
				<Cell>
					<Paragraph>A1</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>B1</Paragraph>
				</Cell>
			</Row>
			<Row>
				<Cell>
					<Paragraph>A2</Paragraph>
				</Cell>
				<Cell>
					<Paragraph>B2</Paragraph>
				</Cell>
			</Row>
		</Table>
	</Document>,
);

api.docx.toArchive().toFile('y.docx');
