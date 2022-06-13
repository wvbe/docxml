/** @jsx Application.JSX */

import Application, { Document, Paragraph, Section, Text } from '../mod.ts';

await Application.writeAstToDocx(
	'hello-world.docx',
	<Document>
		<Section>
			<Paragraph>
				<Text>
					This is a hello-world example of outputting a Word document. It contains two sections with
					one paragraph each.
				</Text>
			</Paragraph>
		</Section>
		<Section>
			<Paragraph>
				<Text>This is the second section.</Text>
			</Paragraph>
		</Section>
	</Document>,
);
