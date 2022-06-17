/**
 * @jsx app.JSX
 *
 * @file
 * This file demonstrates that an XML diff can be transformed into DOCX change tracking
 * information.
 *
 * The XML diff of choice is {@link https://documentation.fontoxml.com/latest/export-fonto-document-history-diffs-81177763523b Fonto Document History's exported format}.
 */

import Application, {
	DeletedText,
	Document,
	InsertedText,
	Paragraph,
	Section,
	Table,
	TableCell,
	TableRow,
	Text,
} from '../mod.ts';

const app = new Application();

const LIST_INDENTATION_WIDTH = '1cm';

/*
 * Generics
 */

app.add('self::node()', () => null);

app.add('self::element()', ({ traverse }) => traverse('./*'));

app.add('self::document-node()', async ({ traverse, template }) => {
	return <Document template={await template.init()}>{traverse('./*')}</Document>;
});

app.add('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);

/*
 * Blocks
 */

app.add('self::recipe', ({ traverse }) => <Section>{traverse('./*')}</Section>);

app.add('self::title', ({ traverse, template }) => (
	<Paragraph style={template.style('Title')}>{traverse()}</Paragraph>
));

app.add('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>);

/*
 * DESCRIPTION
 */
app.add('self::p[ancestor::description]', ({ traverse, template }) => (
	<Paragraph style={template.style('Strong1')}>{traverse()}</Paragraph>
));

/*
 * ALLERGY WARNING
 */

app.add('self::allergy-warning', ({ traverse, template }) => [
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

app.add('self::p[ancestor::allergy-warning]', ({ traverse, template }) => (
	<Paragraph style={template.style('Intense Emphasis')}>{traverse()}</Paragraph>
));

/*
 * STEPS
 */
app.add('self::steps', ({ traverse }) => traverse('./*'));

app.add('self::step', ({ traverse }) => traverse('./*'));

app.add(
	'self::p[parent::step or parent::fxd:*/parent::step][not(preceding-sibling::*)]',
	({ traverse }) => (
		<Paragraph indent={{ start: LIST_INDENTATION_WIDTH }} bullet={{ level: 0 }}>
			{traverse()}
		</Paragraph>
	),
);

app.add(
	'self::p[parent::step or parent::fxd:*/parent::step][preceding-sibling::*]',
	({ traverse }) => <Paragraph indent={{ start: LIST_INDENTATION_WIDTH }}>{traverse()}</Paragraph>,
);

/*
 * INLINES
 */

app.add('self::ingredient', ({ traverse }) => traverse());
app.add('self::text()[parent::ingredient]', ({ node }) => <Text bold>{node.nodeValue}</Text>);

/*
 * TRACKED CHANGES
 */
app.add('self::fxd:addition', ({ traverse }) => traverse());

app.add('self::text()[ancestor::fxd:addition]', ({ node }) => (
	<InsertedText id={0} author={'Wybe'} date={new Date().toISOString()}>
		{node.nodeValue}
	</InsertedText>
));

app.add('self::fxd:deletion', ({ traverse }) => traverse());
app.add('self::text()[ancestor::fxd:deletion]', ({ node }) => (
	<DeletedText id={0} author={'Wybe'} date={new Date().toISOString()}>
		{node.nodeValue}
	</DeletedText>
));

/*
 * SCRIPT EXECUTION
 */
await app.execute({
	source: new URL('.', import.meta.url).pathname + '/mushroom-lunch.xml',
	destination: 'mushroom-lunch.docx',
});
