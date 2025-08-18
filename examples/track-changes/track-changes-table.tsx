/** @jsx  Docx.jsx */
import Docx, { Cell, Paragraph, Row, Section, Table, Text } from '../../mod.ts';

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
	new Row(
		{ deletion: { author: 'Ángel', date: date, id: 1 } },
		new Cell({}, new Paragraph({}, new Text({}, ' my new friend.')))
	),
	new Row(
		{},
		new Cell(
			{ deletion: { author: 'Carlos', date: date, id: 2 } },
			new Paragraph({}, new Text({}, 'Bye!'))
		),
		new Cell(
			{ insertion: { author: 'Carlos', date: date, id: 2 } },
			new Paragraph({}, new Text({}, 'Hello!'))
		)
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
		<Row deletion={{ id: 1, author: 'ines', date: new Date() }}>
			<Cell>
				<Paragraph> my new friend.</Paragraph>
			</Cell>
		</Row>
		<Row>
			<Cell deletion={{ id: 2, author: 'carlos', date: new Date() }}>
				<Paragraph> Bye!</Paragraph>
			</Cell>
			<Cell insertion={{ id: 2, author: 'carlos', date: new Date() }}>
				<Paragraph> Hello!</Paragraph>
			</Cell>
		</Row>
	</Table>
).toFile('track-changes-table-jsx.docx');
