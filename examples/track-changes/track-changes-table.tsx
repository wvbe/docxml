/** @jsx  Docx.jsx */
import Docx, {
	Cell,
	Paragraph,
	Row,
	RowDeletion,
	Section,
	Table,
	Text,
} from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

const date = new Date();

// Create a new table that includes a row, a row deletion, and a row addition.
const testTable = new Table(
	{},
	new Row(
		{ insertion: { author: 'Luis', date: date, id: 1 } },
		new Cell({}, new Paragraph({}, new Text({}, ' my old friend.')))
	),
	new RowDeletion(
		{ id: 2, author: 'Inés', date: new Date() },
		new Cell({}, new Paragraph({}, new Text({}, ' sunlight comes')))
	)
);

// Create a section as the parent of our new paragraph.
const testSection = new Section({}, testTable);

// Set that section as the content of our document.
docxFile.document.set(testSection);

// Save our document.
await docxFile.toFile('track-changes-table.docx');

// Alternatively, you can use JSX:
await Docx.fromJsx(
	<Table>
		<Row insertion={{ id: 1, author: 'ines', date: new Date() }}>
			<Cell>
				<Paragraph> my old friend.</Paragraph>
			</Cell>
		</Row>
		<RowDeletion id={2} author="ines" date={new Date()}>
			<Cell>
				<Paragraph> sunlight comes</Paragraph>
			</Cell>
		</RowDeletion>
	</Table>
).toFile('track-changes-table-jsx.docx');
