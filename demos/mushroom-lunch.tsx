import API, {
	DeletedText,
	Document,
	DocumentNode,
	InsertedText,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	JSX,
	Paragraph,
	Section,
	Table,
	TableCell,
	TableRow,
	Text,
} from '../mod.ts';

const api = new API();

const LIST_INDENTATION_WIDTH = '1cm';
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

api.add('self::recipe', ({ traverse }) => <Section>{traverse('./*')}</Section>);

api.add('self::title', ({ traverse, template }) => (
	<Paragraph style={template.style('Title')}>{traverse()}</Paragraph>
));

api.add('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>);

/*
 * DESCRIPTION
 */
api.add('self::p[ancestor::description]', ({ traverse, template }) => (
	<Paragraph style={template.style('Strong1')}>{traverse()}</Paragraph>
));

/*
 * ALLERGY WARNING
 */

api.add('self::allergy-warning', ({ traverse, template }) => [
	<Paragraph style={template.style('Heading1')}>
		<Text>Allergy warning</Text>
	</Paragraph>,
	// Abuse a single-celled table as a text box
	<Table>
		<TableRow>
			<TableCell>{traverse('./*')}</TableCell>
		</TableRow>
	</Table>,
]);

api.add('self::p[ancestor::allergy-warning]', ({ traverse, template }) => (
	<Paragraph style={template.style('Intense Emphasis')}>{traverse()}</Paragraph>
));

/*
 * STEPS
 */
api.add('self::steps', ({ traverse }) => traverse('./*'));

api.add('self::step', ({ traverse }) => traverse('./*'));

api.add(
	'self::p[parent::step or parent::fxd:*/parent::step][not(preceding-sibling::*)]',
	({ traverse }) => (
		<Paragraph indent={{ start: LIST_INDENTATION_WIDTH }} bullet={{ level: 0 }}>
			{traverse()}
		</Paragraph>
	),
);

api.add(
	'self::p[parent::step or parent::fxd:*/parent::step][preceding-sibling::*]',
	({ traverse }) => <Paragraph indent={{ start: LIST_INDENTATION_WIDTH }}>{traverse()}</Paragraph>,
);

/*
 * INLINES
 */

api.add('self::ingredient', ({ traverse }) => traverse());
api.add('self::text()[parent::ingredient]', ({ node }) => <Text bold>{node.nodeValue}</Text>);

/*
 * TRACKED CHANGES
 */
api.add('self::fxd:addition', ({ traverse }) => traverse());

api.add('self::text()[ancestor::fxd:addition]', ({ node }) => (
	<InsertedText id={0} author={'Wybe'} date={new Date().toISOString()}>
		{node.nodeValue}
	</InsertedText>
));

api.add('self::fxd:deletion', ({ traverse }) => traverse());
api.add('self::text()[ancestor::fxd:deletion]', ({ node }) => (
	<DeletedText id={0} author={'Wybe'} date={new Date().toISOString()}>
		{node.nodeValue}
	</DeletedText>
));

/*
 * SCRIPT EXECUTION
 */
const xmlString = await Deno.readTextFile(
	new URL('.', import.meta.url).pathname + '/mushroom-lunch.xml',
);
if (Deno.args.includes('--ast')) {
	const ast = await api.renderXmlStringToAst(xmlString);
	if (!ast) {
		throw new Error('The XML resulted in an empty document');
	}
	console.log(API.stringifyAst(ast as DocumentNode));
} else {
	await api.writeXmlToDocx(xmlString, 'mushroom-lunch.docx');
}
