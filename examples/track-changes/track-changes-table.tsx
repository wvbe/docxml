/** @jsx  Docx.jsx */
import { pt } from '../../lib/utilities/src/length.ts';
import Docx, { Cell, Paragraph, Row, Section, Table, Text } from '../../mod.ts';

// Create a new .docx file with track changes enabled.
const docxFile = Docx.fromNothing().withSettings({
	isTrackChangesEnabled: true,
});

const date = new Date();

// Create a new table that includes a row, a row deletion, and a row addition.
const testTable = new Table(
	{
		cellPadding: {
			top: pt(10),
			bottom: pt(10),
		},
		columnWidths: [pt(48), pt(48), pt(48), pt(48)],
		columnWidthChange: { id: 1, cols: [pt(24), pt(24), pt(24), pt(24)] },
		change: {
			id: 2,
			author: 'Ines',
			date: new Date(),
			cellPadding: {
				top: pt(24),
				bottom: pt(24),
			},
		},
	},
	new Row(
		{ insertion: { author: 'Luis', date: date, id: 1 } },
		new Cell({}, new Paragraph({}, new Text({}, ' my old friend.')))
	),
	new Row(
		{ deletion: { author: 'Ángel', date: date, id: 1 } },
		new Cell({}, new Paragraph({}, new Text({}, ' my new friend.')))
	),
	new Row(
		{
			cellSpacing: pt(12),
			change: {
				id: 1,
				author: 'Luis',
				cellSpacing: pt(24),
			}
		},
		new Cell(
			{ deletion: { author: 'Carlos', date: date, id: 2 } },
			new Paragraph({}, new Text({}, 'Bye!'))
		),
		new Cell(
			{ insertion: { author: 'Carlos', date: date, id: 2 } },
			new Paragraph({}, new Text({}, 'Hello!'))
		)
	),
	new Row(
		{},
		new Cell(
			{
				borders: {
					top: {
						color: '0000FF',
						width: pt(10),
					},
				},
				shading: {
					background: 'FF0000',
					pattern: 'pct5',
				},
				change: {
					id: 1,
					author: 'Gabe',
					date: new Date(),
					shading: {
						background: '00FF00',
						pattern: 'pct5',
					},
					borders: {
						top: {
							color: '0000FF',
							type: 'single',
							width: pt(2),
						},
					},
				},
			},
			new Paragraph({}, new Text({}, 'Cell Property change'))
		),
		new Cell({}, new Paragraph({}, new Text({}, 'And unchanged.')))
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
