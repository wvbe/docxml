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

app.match('self::node()', () => null);

app.match('self::element()', ({ traverse }) => traverse('./*'));

app.match('self::document-node()', async ({ traverse, template }) => {
	return <Document template={await template.init()}>{traverse('./*')}</Document>;
});

app.match('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);

/*
 * Blocks
 */

app.match('self::recipe', ({ traverse }) => <Section>{traverse('./*')}</Section>);

app.match('self::title', ({ traverse, template }) => (
	<Paragraph style={template.style('Title')}>{traverse()}</Paragraph>
));

app.match('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>);

/*
 * DESCRIPTION
 */
app.match('self::p[ancestor::description]', ({ traverse, template }) => (
	<Paragraph style={template.style('Strong1')}>{traverse()}</Paragraph>
));

/*
 * ALLERGY WARNING
 */

app.match('self::allergy-warning', ({ traverse, template }) => [
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

app.match('self::p[ancestor::allergy-warning]', ({ traverse, template }) => (
	<Paragraph style={template.style('Intense Emphasis')}>{traverse()}</Paragraph>
));

/*
 * STEPS
 */
app.match('self::steps', ({ traverse }) => traverse('./*'));

app.match('self::step', ({ traverse }) => traverse('./*'));

app.match(
	'self::p[parent::step or parent::fxd:*/parent::step][not(preceding-sibling::*)]',
	({ traverse }) => (
		<Paragraph indent={{ start: LIST_INDENTATION_WIDTH }} bullet={{ level: 0 }}>
			{traverse()}
		</Paragraph>
	),
);

app.match(
	'self::p[parent::step or parent::fxd:*/parent::step][preceding-sibling::*]',
	({ traverse }) => <Paragraph indent={{ start: LIST_INDENTATION_WIDTH }}>{traverse()}</Paragraph>,
);

/*
 * INLINES
 */

app.match('self::ingredient', ({ traverse }) => traverse());
app.match('self::text()[parent::ingredient]', ({ node }) => <Text bold>{node.nodeValue}</Text>);

/*
 * TRACKED CHANGES
 */
app.match('self::fxd:addition', ({ traverse }) => traverse());

app.match('self::text()[ancestor::fxd:addition]', ({ node }) => (
	<InsertedText id={0} author={'Wybe'} date={new Date().toISOString()}>
		{node.nodeValue}
	</InsertedText>
));

app.match('self::fxd:deletion', ({ traverse }) => traverse());
app.match('self::text()[ancestor::fxd:deletion]', ({ node }) => (
	<DeletedText id={0} author={'Wybe'} date={new Date().toISOString()}>
		{node.nodeValue}
	</DeletedText>
));

/*
 * SCRIPT EXECUTION
 */
await app.cli({
	source: new URL('.', import.meta.url).pathname + '/mushroom-lunch.xml',
	destination: 'mushroom-lunch.docx',
});
