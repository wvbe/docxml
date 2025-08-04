/** @jsx  Docx.jsx */
import Docx, { Insertion, Paragraph, Section, Text } from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

const date = new Date();

// Create a new inserted paragraph
const testParagraph = new Paragraph(
	{ pilcrow: { insertion: { author: 'Luis', date: date, id: 1 } } },
	new Insertion(
		{ author: 'Luis', date: date, id: 1 },
		new Text({}, 'my old friend.')
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section({}, testParagraph);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes-insertion.docx');

// Alternatively, you can use JSX:
await Docx.fromJsx(
	<Paragraph pilcrow={{ insertion: { id: 1, author: 'ines', date: date } }}>
		<Insertion id={0} author="Ines" date={date}>
			my old friend.
		</Insertion>
	</Paragraph>
).toFile('track-changes-insertion-jsx.docx');
