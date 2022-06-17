/**
 * @jsx Application.JSX
 *
 * @file
 * This file demonstrates a simple table in DOCX, and repeating its first row on every page.
 */

import Application, {
	Document,
	Paragraph,
	Section,
	Table,
	TableCell,
	TableRow,
	Text,
} from '../mod.ts';

await Application.writeAstToDocx(
	'tables.docx',
	<Document>
		<Section>
			<Table>
				{Array.from(new Array(500)).map((_, index) => (
					<TableRow tableHeader={index === 0}>
						<TableCell>
							<Paragraph>
								<Text bold={index === 0}>{String(index + 1)}A</Text>
							</Paragraph>
						</TableCell>
						<TableCell>
							<Paragraph>
								<Text bold={index === 0}>{String(index + 1)}B</Text>
							</Paragraph>
						</TableCell>
						<TableCell>
							<Paragraph>
								<Text bold={index === 0}>{String(index + 1)}C</Text>
							</Paragraph>
						</TableCell>
						<TableCell>
							<Paragraph>
								<Text bold={index === 0}>{String(index + 1)}D</Text>
							</Paragraph>
						</TableCell>
					</TableRow>
				))}
			</Table>
		</Section>
	</Document>,
);
