/**
 * @jsx Application.JSX
 *
 * @file
 * This file demonstates DOCX's change tracking information.
 */

import Application, {
	DeletedText,
	Document,
	InsertedText,
	Paragraph,
	Section,
	Text,
} from '../mod.ts';

await Application.writeAstToDocx(
	'with-changes.docx',
	<Document
		features={{
			trackRevisions: true,
		}}
	>
		<Section>
			<Paragraph>
				<Text>This is a </Text>
				<DeletedText id={1} author="Wybe" date={new Date().toISOString()}>
					hello-world{' '}
				</DeletedText>
				<Text>example of outputting a Word document.</Text>
				<InsertedText id={2} author="Wybe" date={new Date().toISOString()}>
					{' '}
					It contains two sections with one paragraph each.
				</InsertedText>
			</Paragraph>
		</Section>
		<Section>
			<Paragraph>
				<Text>This is the second section.</Text>
			</Paragraph>
		</Section>
	</Document>,
);
