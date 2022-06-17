/**
 * @jsx Application.JSX
 *
 * @file
 * This file demonstrates a simple use of DOTX template files to source visual styles from.
 */

import { resolve } from 'https://deno.land/std@0.141.0/path/mod.ts';

import Application, { Document, DotxTemplate, Paragraph, Section, Text } from '../mod.ts';

const template = new DotxTemplate(
	resolve(new URL('.', import.meta.url).pathname, 'from-template.dotx'),
);

await Application.writeAstToDocx(
	'from-template.docx',
	<Document template={await template.init()}>
		<Section>
			<Paragraph style={template.style('Title')}>
				<Text>This is a title in one of Word's default styles</Text>
			</Paragraph>
			<Paragraph>
				<Text>This is a normal paragraph. It is not associated with any template styles.</Text>
			</Paragraph>
			<Paragraph style={template.style('MyCustomStyle')}>
				<Text>
					This is a styled paragraph. The style for it was originally custom made through MS Word.
				</Text>
			</Paragraph>
		</Section>
		<Section></Section>
	</Document>,
);
