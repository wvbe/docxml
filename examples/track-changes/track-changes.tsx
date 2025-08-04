/** @jsx  Docx.jsx */
import { inch } from '../../lib/utilities/src/length.ts';
import Docx, {
	Insertion,
	Paragraph,
	Section,
	Text,
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
	new Insertion(
		{ id: 2, author: 'Paul Simon', date: new Date() },
		new Text({}, 'darkness')
	),
	new Text({}, ' my old friend.'),
	new Insertion(
		{ id: 1, author: 'Gabe', date: new Date() },
		new Text({}, ` I've come to talk with you again.`)
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section(
	{
		pageWidth: inch(11),
		pageHeight: inch(8.5),
		change: {
			id: 1,
			author: 'Gabe',
			date: new Date(),
			pageOrientation: 'portrait',
			pageWidth: inch(8.5),
			pageHeight: inch(11),
		},
	},
	testParagraph
);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes.docx');

// Alternatively, you can use JSX:
await Docx.fromJsx(
	<Section>
		<Paragraph>
			<Text>Four score and </Text>
			<TextDeletion id={1} author="Gabe" date={new Date()}>
				<Text>six</Text>
			</TextDeletion>
			<Insertion id={1} author="Gabe" date={new Date()}>
				<Text>seven</Text>
			</Insertion>
			<Text> years ago...</Text>
		</Paragraph>
	</Section>
).toFile('track-changes-jsx.docx');
