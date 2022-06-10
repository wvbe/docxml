/** @jsx JSX */

import API, {
	Document,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	JSX,
	Paragraph,
	Section,
	Text,
} from '../mod.ts';

await API.writeAstToDocx(
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
