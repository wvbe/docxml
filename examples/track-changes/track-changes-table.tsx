/** @jsx  Docx.jsx */
import Docx, {
	Paragraph,
	RowAddition,
	RowDeletion,
	Section,
	Table,
	Text,
} from '../../mod.ts';
import { Cell } from '../../src/components/Cell.ts';
import { Row } from '../../src/components/Row.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

// Create a new table that includes a row, a row deletion, and a row addition.
const testTable = new Table(
	{},
	new Row(
		{},
		new Cell({}, new Paragraph({}, new Text({}, ' my old friend.')))
	),
	new RowAddition(
		{
			id: 1,
			author: 'Inés',
			date: new Date(),
		},
		new Cell({}, new Paragraph({}, new Text({}, ' it is time')))
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
		<Row>
			<Cell>
				<Paragraph> my old friend.</Paragraph>
			</Cell>
		</Row>
		<RowAddition id={1} author="ines" date={new Date()}>
			<Cell>
				<Paragraph> it is time</Paragraph>
			</Cell>
		</RowAddition>
		<RowDeletion id={2} author="ines" date={new Date()}>
			<Cell>
				<Paragraph> sunlight comes</Paragraph>
			</Cell>
		</RowDeletion>
	</Table>
).toFile('track-changes-table-jsx.docx');
