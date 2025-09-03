/** @jsx  Docx.jsx */
import Docx, {
	Deletion,
	type FootnoteProps,
	FootnoteReference,
	Paragraph,
	Section,
	Text,
} from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

const date = new Date();

const footnoteProps: FootnoteProps = {
	numberingFormat: 'decimal',
	position: 'pageBottom',
	restart: 'eachPage',
};

const footnoteReferenceStyleName = 'FootnoteReference';

const footnoteRefNumber = await docxFile.document.footnotes.add(
	new Paragraph({}, new Text({}, 'This is the text content of my Footnote.')),
	footnoteReferenceStyleName
);

// Create a new deleted paragraph
const testDeletedParagraph = new Paragraph(
	{ pilcrow: { deletion: { author: 'Ángel', date: date, id: 1 } } },
	new Deletion(
		{ author: 'Ángel', date: date, id: 1 },
		new Text({}, 'This is just a test.'),
		new FootnoteReference({
			id: footnoteRefNumber,
			style: footnoteReferenceStyleName,
		})
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section(
	{ footnotes: footnoteProps },
	testDeletedParagraph
);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes-deletion.docx');

// Alternatively, you can use JSX:
const jsxFile = Docx.fromNothing();

const footnoteId = await jsxFile.document.footnotes.add(
	new Paragraph({}, new Text({}, 'This is a footnote')),
	footnoteReferenceStyleName
);

jsxFile.document.set(
	<Section footnotes={footnoteProps}>
		<Paragraph
			pilcrow={{
				deletion: { id: 1, author: 'ines', date: new Date() },
			}}
		>
			<Deletion id={0} author="Ines" date={new Date()}>
				<Text>This is also a test</Text>
				<FootnoteReference
					id={footnoteId}
					style={footnoteReferenceStyleName}
				/>
			</Deletion>
		</Paragraph>
	</Section>
);

await jsxFile.toFile('track-changes-deletion-jsx.docx');
