/** @jsx API.JSX */

import API, { cm, Document, Paragraph, Section, Text } from './mod.ts';

const api = new API();

api.document.set(
	<Document>
		<Section pageWidth={cm(20)} pageHeight={cm(20)}>
			<Paragraph>
				<Text>Section 1, paragraph 1</Text>
			</Paragraph>
			<Paragraph>
				<Text>Section 1, paragraph 2</Text>
			</Paragraph>
			<Paragraph>
				<Text>Section 1, paragraph 3</Text>
			</Paragraph>
		</Section>
		<Section pageWidth={cm(30)} pageHeight={cm(12)}>
			<Paragraph>
				<Text>Section 2, paragraph 1</Text>
			</Paragraph>
			<Paragraph>
				<Text>Section 2, paragraph 2</Text>
			</Paragraph>
			<Paragraph>
				<Text>Section 2, paragraph 3</Text>
			</Paragraph>
		</Section>
	</Document>,
);

api.docx.toArchive().toFile('section.docx');
