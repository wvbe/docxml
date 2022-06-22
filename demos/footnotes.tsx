/**
 * @jsx Application.JSX
 */

import Application, {
	Document,
	FootnoteReference,
	Paragraph,
	ParagraphNode,
	Section,
	Text,
} from '../mod.ts';

const footnotes: Record<string, ParagraphNode[]> = {
	1: [
		await (
			<Paragraph>
				<Text>Wat is footnote</Text>
			</Paragraph>
		),
	],
};

const ast = await (
	<Document footnotes={footnotes}>
		<Section>
			<Paragraph>
				<Text>
					Document can has footnotes?
					<FootnoteReference id={1} />
				</Text>
			</Paragraph>
			<Paragraph>
				<Text>Sometimes reusing the same footnote?</Text>
			</Paragraph>
		</Section>
	</Document>
);

await Application.writeAstToDocx('footnotes.docx', ast);
