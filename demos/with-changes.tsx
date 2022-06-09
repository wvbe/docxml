import API, {
	DeletedText,
	Document,
	InsertedText,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	JSX,
	Paragraph,
	Section,
	Text,
} from '../mod.ts';

await API.writeAstToDocx(
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
