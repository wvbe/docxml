/**
 * @jsx app.JSX
 *
 * @file
 * This file demonstrates that an XML diff can be transformed into DOCX change tracking
 * information.
 *
 * The XML diff of choice is {@link https://documentation.fontoxml.com/latest/export-fonto-document-history-diffs-81177763523b Fonto Document History's exported format}.
 */

import Application, { Document, Paragraph, Section } from '../mod.ts';

const app = new Application();

app.match('self::node()', () => null);

app.match('self::element()', ({ traverse }) => traverse('./*'));

app.match('self::document-node()', ({ traverse }) => (
	<Document>
		<Section>{traverse('./*')}</Section>
	</Document>
));

app.match('self::text()', ({ node }) => node.nodeValue);

// Use XQUF to rename all <p> to <paragraph>:
app.transform(`
	for $para in //p
		return rename node $para as "paragraph"
`);

app.match('self::p', () => {
	throw new Error('This element should no longer exist, the transformation has failed');
});

app.match('self::paragraph', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>);

await app.cli({
	xml: `<d><p>This element is a "P" node, but the rendering rules only know it as "paragraph".</p></d>`,
	destination: 'transformed.docx',
});
