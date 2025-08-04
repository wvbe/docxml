/** @jsx  Docx.jsx */
import Docx, {
	Move,
	MoveRangeEnd,
	MoveRangeStart,
	Paragraph,
	Section,
	Text,
} from '../../mod.ts';

// Create a new Word document with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

const date = new Date();

// Create an instance of a paragraph where the entire paragraph has been moved. This type of move
// has no range associated with it. It is assumed the parent paragraph is the extent of the range.
const moveToParagraph = new Paragraph(
	{
		pilcrow: {
			move: {
				id: 1,
				date: date,
				type: 'to',
				author: 'Gabe',
			},
		},
	},
	new MoveRangeStart({
		type: 'to',
		name: 'move_0',
		author: 'Gabe',
		date: date,
		id: 3,
	}),
	new Move(
		{
			type: 'to',
			id: 4,
			date: date,
			author: 'Gabe',
		},
		new Text({}, 'This is an example of some moved text.')
	),
	new MoveRangeEnd({
		type: 'to',
		id: 4,
	})
);

const betweenParagraph = new Paragraph(
	{},
	new Text(
		{},
		'This will go before a completely move paragraph, but will show up as after it. '
	)
);

const moveFromParagraph = new Paragraph(
	{
		pilcrow: {
			move: {
				id: 1,
				date: date,
				type: 'from',
				author: 'Gabe',
			},
		},
	},
	new MoveRangeStart({
		type: 'from',
		name: 'move_0',
		author: 'Gabe',
		date: date,
		id: 3,
	}),
	new Move(
		{
			type: 'from',
			id: 4,
			date: date,
			author: 'Gabe',
		},
		new Text({}, 'This is an example of some moved text.')
	),
	new MoveRangeEnd({
		type: 'from',
		id: 4,
	})
);

// Create an instance where text within a paragraph has been been moved. We will need to create a MoveRangeStart
// and MoveRangeEnd and Move for each piece of text that is moved.
const moveTextParagraph = new Paragraph(
	{},
	new MoveRangeStart({
		type: 'to',
		name: 'move_0',
		author: 'Gabe',
		date: date,
		id: 2,
	}),
	new Move(
		{
			type: 'to',
			author: 'Gabe',
			date: date,
			id: 2,
		},
		new Text({}, 'And this is some text that will move to be first.')
	),
	new MoveRangeEnd({
		type: 'to',
		id: 2,
	}),
	new Text({}, ' It will come from the middle of the text. '),
	new MoveRangeStart({
		type: 'from',
		name: 'move_0',
		author: 'Gabe',
		date: date,
		id: 3,
	}),
	new Move(
		{
			type: 'from',
			author: 'Gabe',
			date: date,
			id: 3,
		},
		new Text({}, 'And this is some text that will move to be first.')
	),
	new MoveRangeEnd({
		type: 'from',
		id: 3,
	})
);

// Add all three of the paragraphs we created to our document.
const section = new Section(
	{},
	moveToParagraph,
	betweenParagraph,
	moveFromParagraph,
	moveTextParagraph
);

docxFile.document.set(section);

// Write to a file.
await docxFile.toFile('track-changes-move.docx');

// Alternatively, you can use JSX:
await Docx.fromJsx(
	<Section>
		<Paragraph pilcrow={{ move: { id: 1, type: 'to' } }}>
			<MoveRangeStart id={2} type="to" name="move_0"></MoveRangeStart>
			<Move id={3} type="to">
				<Text>Memories exist outside of time</Text>
			</Move>
			<MoveRangeEnd id={4} type="to"></MoveRangeEnd>
		</Paragraph>
		<Paragraph>
			<Text>
				Silence is a space, a hollow where we take refuge, but where we
				are never truly safe.
			</Text>
		</Paragraph>
		<Paragraph pilcrow={{ move: { id: 1, type: 'from' } }}>
			<MoveRangeStart id={2} type="from" name="move_0"></MoveRangeStart>
			<Move id={3} type="from">
				<Text>Memories exist outside of time</Text>
			</Move>
			<MoveRangeEnd id={4} type="from"></MoveRangeEnd>
		</Paragraph>

		<Paragraph>
			<MoveRangeStart id={5} type="to" name="move_1"></MoveRangeStart>
			<Move id={6} type="to">
				<Text>
					For none could tame our savage souls yet you the challenge
					met,
				</Text>
			</Move>
			<MoveRangeEnd id={7} type="to"></MoveRangeEnd>
			<Text>
				Under palest watch, you taught, we changed, base instincts were
				redeemed,
			</Text>
			<MoveRangeStart id={5} type="from" name="move_1"></MoveRangeStart>
			<Move id={6} author="Inés" type="from">
				<Text>
					{' '}
					For none could tame our savage souls yet you the challenge
					met,
				</Text>
			</Move>
			<MoveRangeEnd id={7} type="from"></MoveRangeEnd>
		</Paragraph>
	</Section>
).toFile('track-changes-move-jsx.docx');
