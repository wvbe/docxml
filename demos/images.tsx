/** @jsx Application.JSX */

import { resolve } from 'https://deno.land/std@0.141.0/path/mod.ts';

import Application, { Document, Image, Paragraph, Section, Text } from '../mod.ts';

const __dirname = new URL('.', import.meta.url).pathname;

await Application.writeAstToDocx(
	'images.docx',
	<Document>
		<Section>
			<Paragraph>
				<Text>This file should contain an image.</Text>
			</Paragraph>
			<Paragraph>
				<Image
					path={resolve(__dirname, 'assets', 'OuWxL.jpeg')}
					transformation={{
						width: 614,
						height: 472,
					}}
				/>
			</Paragraph>
		</Section>
	</Document>,
);
