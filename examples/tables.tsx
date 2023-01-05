/** @jsx Docx.jsx */
import Docx, { Cell, cm, Paragraph, pt, Row, Table } from '../mod.ts';

await Docx.fromJsx(
	<Table
		columnWidths={[cm(3), cm(5)]}
		borders={{
			bottom: { color: '666666', width: pt(1), type: 'single' },
			left: { color: '666666', width: pt(1), type: 'single' },
			top: { color: '666666', width: pt(1), type: 'single' },
			right: { color: '666666', width: pt(1), type: 'single' },
			insideH: { color: 'CCCCCC', width: pt(1), type: 'dashed' },
			insideV: { color: 'CCCCCC', width: pt(1), type: 'dashed' },
		}}
	>
		<Row>
			<Cell>
				<Paragraph>Cannibal Ox</Paragraph>
			</Cell>
			<Cell>
				<Paragraph>Pigeon</Paragraph>
			</Cell>
		</Row>
		<Row>
			<Cell rowSpan={3}>
				<Paragraph>King Geedorah</Paragraph>
			</Cell>
			<Cell>
				<Paragraph>Lockjaw</Paragraph>
			</Cell>
		</Row>
		<Row>
			<Cell>
				<Paragraph>Anti-Matter</Paragraph>
			</Cell>
		</Row>
	</Table>,
).toFile('tables.docx');
