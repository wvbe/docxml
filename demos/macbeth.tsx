/**
 * @jsx application.JSX
 *
 * @file
 * This file demonstrates a pretty realistic transformation of XML (a Shakespearean play) to DOCX,
 * making use of a DOTX template file to source some of the visual styles used.
 *
 * Run this from your terminal like so;
 *
 * ```sh
 * deno run -A macbeth.tsx --source macbeth.xml --destination macbeth.docx
 * ```
 *
 * Or;
 *
 * ```sh
 * cat macbeth.xml | deno run -A macbeth.tsx > macbeth.docx
 * ```
 */

import { resolve } from 'https://deno.land/std@0.147.0/path/mod.ts';
import { evaluateXPathToString } from 'https://esm.sh/fontoxpath@3.26.1';

import Application, { Document, DotxTemplate, Paragraph, Section, Text } from '../mod.ts';

const application = new Application(
	new DotxTemplate(resolve(new URL('.', import.meta.url).pathname, 'macbeth.dotx')),
);

/*
 * Generics
 */

application.match('self::node()', () => null);

application.match('self::element()', ({ traverse }) => traverse('./*'));

application.match('self::document-node()', ({ traverse }) => (
	<Document>{traverse('./*')}</Document>
));

application.match('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);

/*
 * Blocks
 */

application.match('self::play', ({ traverse }) => [
	<Section>{traverse('./(title | playwright | edition)')}</Section>,
	traverse('./personae'),
	traverse('./act'),
]);

application.match('self::title', ({ traverse, template }) => (
	<Paragraph style={template.style('Title')}>{traverse()}</Paragraph>
));

application.match('self::playwright', ({ traverse, template }) => (
	<Paragraph style={template.style('Subtitle')}>{traverse()}</Paragraph>
));

application.match('self::edition', ({ traverse, template }) => (
	<Paragraph style={template.style('SubtitleEdition')}>{traverse()}</Paragraph>
));

application.match('self::act', ({ node, traverse, template }) => (
	<Section>
		<Paragraph style={template.style('Heading1')}>
			<Text>
				{'Act ' + evaluateXPathToString('count(preceding-sibling::act) + 1', node) + ': '}
				{evaluateXPathToString('./acttitle', node)}
			</Text>
		</Paragraph>
		{traverse('./scene/*')}
	</Section>
));

application.match('self::scenetitle', ({ traverse, template }) => (
	<Paragraph style={template.style('Heading2')}>{traverse()}</Paragraph>
));

application.match('self::speech', ({ traverse }) => traverse('./*'));

application.match('self::speaker', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechSpeaker')}>{traverse()}</Paragraph>
));

application.match('self::line', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechLine')}>{traverse()}</Paragraph>
));

application.match('self::stagedir', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechStageDir')}>{traverse()}</Paragraph>
));

/*
 * Inlines
 */

application.match('self::name', ({ traverse }) => traverse());
application.match('self::text()[parent::name]', ({ node }) => (
	<Text smallCaps>{node.nodeValue}</Text>
));

application.match('self::italic', ({ traverse }) => traverse());
application.match('self::text()[parent::italic]', ({ node }) => (
	<Text italics>{node.nodeValue}</Text>
));

await application.cli();
