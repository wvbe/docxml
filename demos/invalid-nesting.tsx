/**
 * @jsx Application.JSX
 *
 * @file
 * This file demonstrates that the system more-or-less corrects components that have been nested
 * into one another in a way that is not supported by Word.
 *
 * In this example, `<Text>` is contained within `<Text>`, which is invalid. The system will split
 * the parent `<Text>` into two halves, and put the inner `<Text>` in between them -- all three
 * `<Text>` are now direct children of `<Paragraph>`.
 */

import Application, { Document, Paragraph, Section, Text } from '../mod.ts';

await Application.writeAstToDocx(
	'invalid-nesting.docx',
	<Document>
		<Section>
			<Paragraph>
				<Text>
					A text is not normally able to have{' '}
					<Text bold italics allCaps>
						another text
					</Text>{' '}
					nested into it.
				</Text>
			</Paragraph>
		</Section>
		<Section>
			<Paragraph>
				<Text>Derp</Text>
			</Paragraph>
		</Section>
	</Document>,
);
