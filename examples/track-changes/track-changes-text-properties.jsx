/** @jsx  Docx.jsx */
import Docx, { Paragraph, Section, Text } from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

// Create a new paragraph that includes text, a text deletion, and a text addition.
const testParagraph = new Paragraph(
	{},
	new Text(
		{
			insertion: { id: 1, author: 'ines', date: new Date() },
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
		'my old friend.'
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section({}, testParagraph);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes-text-properties.docx');

// Alternatively, you can use JSX:
await Docx.fromJsx(
	<Paragraph>
		<Text
			pilcrow={{ insertion: { id: 1, author: 'ines', date: new Date() } }}
			color="red"
			isItalic
			change={{
				author: 'Gabe',
				id: 22,
				date: new Date(),
				isBold: true,
				color: 'blue',
			}}
		>
			I've come to talk with you again.
		</Text>
	</Paragraph>
).toFile('track-changes-text-properties-jsx.docx');
