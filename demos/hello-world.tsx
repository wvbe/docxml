/**
 * @jsx Application.JSX
 *
 * @file
 * This file demonstrates a very simple DOCX output.
 */

import Application, { Document, Paragraph, Section, Text } from '../mod.ts';

const ast = await (
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
	</Document>
);

await Application.writeAstToDocx('hello-world.docx', ast);
