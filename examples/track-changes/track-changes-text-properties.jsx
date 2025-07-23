/** @jsx  Docx.jsx */
import Docx, {
	Paragraph,
	Section,
	Text,
	TextAddition,
	TextDeletion,
} from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

// Create a new paragraph that includes text, a text deletion, and a text addition.
const testParagraph = new Paragraph(
	{},
	new Text({}, 'Hello, '),
	new TextDeletion(
		{
			id: 2,
			author: 'Gabe',
			date: new Date(),
		},
		new Text({}, 'nighttime')
	),
	new TextAddition(
		{ id: 2, author: 'Paul Simon', date: new Date() },
		new Text({}, 'darkness')
	),
	new Text({}, ' my old friend.'),

	// This will set our current text style as italics. It will also create a recorded change
	// that indicates the text style **was** bold, but is no longer.
	new TextAddition(
		{ id: 1, author: 'Gabe', date: new Date() },
		new Text(
			{
				color: 'red',
				isItalic: true,
				change: {
					author: 'Gabe',
					id: 22,
					date: new Date(),
					isBold: true,
					color: 'blue',
				},
			},
			` I've come to talk with you again.`
		)
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section({}, testParagraph);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-text-property-changes.docx');
