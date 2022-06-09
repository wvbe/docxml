import { resolve } from 'https://deno.land/std@0.141.0/path/mod.ts';
import { evaluateXPathToString } from 'https://esm.sh/fontoxpath@3.26.0';

import API, {
	Document,
	DocumentNode,
	DotxTemplate,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	JSX,
	Paragraph,
	Section,
	Text,
} from '../mod.ts';

const api = new API();

api.template(new DotxTemplate(resolve(new URL('.', import.meta.url).pathname, 'macbeth.dotx')));

/*
 * Generics
 */

api.add('self::node()', () => null);

api.add('self::element()', ({ traverse }) => traverse('./*'));

api.add('self::document-node()', async ({ traverse, template }) => {
	return <Document template={await template.init()}>{traverse('./*')}</Document>;
});

api.add('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);

/*
 * Blocks
 */

api.add('self::play', ({ traverse }) => [
	<Section>{traverse('./(title | playwright | edition)')}</Section>,
	traverse('./personae'),
	traverse('./act'),
]);

api.add('self::title', ({ traverse, template }) => (
	<Paragraph style={template.style('Title')}>{traverse()}</Paragraph>
));

api.add('self::playwright', ({ traverse, template }) => (
	<Paragraph style={template.style('Subtitle')}>{traverse()}</Paragraph>
));

api.add('self::edition', ({ traverse, template }) => (
	<Paragraph style={template.style('SubtitleEdition')}>{traverse()}</Paragraph>
));

api.add('self::personae', () => null);

api.add('self::persona', ({ traverse, template }) => [
	<Paragraph style={template.style('Heading2')}>{traverse('./persname/text()')}</Paragraph>,
]);

api.add('self::act', ({ node, traverse, template }) => (
	<Section>
		<Paragraph style={template.style('Heading1')}>
			<Text>
				Act{' '}
				{
					// @TODO JSX should accept a number here
					evaluateXPathToString('count(preceding-sibling::act) + 1', node)
				}
				: {evaluateXPathToString('./acttitle', node)}
			</Text>
		</Paragraph>
		{traverse('./scene/*')}
	</Section>
));

api.add('self::scenetitle', ({ traverse, template }) => (
	<Paragraph style={template.style('Heading2')}>{traverse()}</Paragraph>
));

api.add('self::speech', ({ traverse }) => traverse('./*'));

api.add('self::speaker', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechSpeaker')}>{traverse()}</Paragraph>
));

api.add('self::line', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechLine')}>{traverse()}</Paragraph>
));

api.add('self::stagedir', ({ traverse, template }) => (
	<Paragraph style={template.style('SpeechStageDir')}>{traverse()}</Paragraph>
));

/*
 * Inlines
 */

api.add('self::name', ({ traverse }) => traverse());
api.add('self::text()[parent::name]', ({ node }) => <Text smallCaps>{node.nodeValue}</Text>);

api.add('self::italic', ({ traverse }) => traverse());
api.add('self::text()[parent::italic]', ({ node }) => <Text italics>{node.nodeValue}</Text>);

/*
 * Execute
 */
const xmlString = await Deno.readTextFile(new URL('.', import.meta.url).pathname + '/macbeth.xml');
if (Deno.args.includes('--ast')) {
	const ast = await api.renderXmlStringToAst(xmlString);
	if (!ast) {
		throw new Error('The XML resulted in an empty document');
	}
	console.log(API.stringifyAst(ast as DocumentNode));
} else {
	await api.writeXmlToDocx(xmlString, 'macbeth.docx');
}
