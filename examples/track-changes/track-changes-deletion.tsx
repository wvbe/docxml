/** @jsx  Docx.jsx */
import Docx, { Deletion, Paragraph, Section, Text } from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

const date = new Date();

// Create a new deleted paragraph
const testDeletedParagraph = new Paragraph(
	{ pilcrow: { deletion: { author: 'Ángel', date: date, id: 1 } } },
	new Deletion(
		{ author: 'Ángel', date: date, id: 1 },
		new Text({}, 'This is just a test.')
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section({}, testDeletedParagraph);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes-deletion.docx');

// Alternatively, you can use JSX:
await Docx.fromJsx(
	<Section>
		<Paragraph
			pilcrow={{ deletion: { id: 1, author: 'ines', date: new Date() } }}
		>
			<Deletion id={0} author="Ines" date={new Date()}>
				my old friend.
			</Deletion>
		</Paragraph>
	</Section>
).toFile('track-changes-deletion-jsx.docx');
