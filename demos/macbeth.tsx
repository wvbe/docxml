/** @jsx application.JSX */

import { resolve } from 'https://deno.land/std@0.141.0/path/mod.ts';
import { evaluateXPathToString } from 'https://esm.sh/fontoxpath@3.26.0';

import Application, { Document, DotxTemplate, Paragraph, Section, Text } from '../mod.ts';

const application = new Application();

application.template(
	new DotxTemplate(resolve(new URL('.', import.meta.url).pathname, 'macbeth.dotx')),
);

/*
 * Generics
 */

application.add('self::node()', () => null);

application.add('self::element()', ({ traverse }) => traverse('./*'));

application.add('self::document-node()', async ({ traverse, template }) => {
	return <Document template={await template.init()}>{traverse('./*')}</Document>;
});

application.add('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);

/*
 * Blocks
 */

application.add('self::play', ({ traverse }) => [
	<Section>{traverse('./(title | playwright | edition)')}</Section>,
	traverse('./personae'),
	traverse('./act'),
]);

application.add('self::title', ({ traverse, template }) => (
	<Paragraph style={template.style('Title')}>{traverse()}</Paragraph>
));

application.add('self::playwright', ({ traverse, template }) => (
	<Paragraph style={template.style('Subtitle')}>{traverse()}</Paragraph>
));

application.add('self::edition', ({ traverse, template }) => (
	<Paragraph style={template.style('SubtitleEdition')}>{traverse()}</Paragraph>
));

application.add('self::act', ({ node, traverse, template }) => (
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

application.add('self::scenetitle', ({ traverse, template }) => (
	<Paragraph style={template.style('Heading2')}>{traverse()}</Paragraph>
));

application.add('self::speech', ({ traverse }) => traverse('./*'));

application.add('self::speaker', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechSpeaker')}>{traverse()}</Paragraph>
));

application.add('self::line', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechLine')}>{traverse()}</Paragraph>
));

application.add('self::stagedir', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechStageDir')}>{traverse()}</Paragraph>
));

/*
 * Inlines
 */

application.add('self::name', ({ traverse }) => traverse());
application.add('self::text()[parent::name]', ({ node }) => (
	<Text smallCaps>{node.nodeValue}</Text>
));

application.add('self::italic', ({ traverse }) => traverse());
application.add('self::text()[parent::italic]', ({ node }) => (
	<Text italics>{node.nodeValue}</Text>
));

await application.execute();
