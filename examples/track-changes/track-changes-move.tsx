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
docxFile.toFile('track-changes-move.docx');
