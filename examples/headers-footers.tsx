/** @jsx Docx.jsx */
import Docx, { Paragraph, Section } from '../mod.ts';

const docx = Docx.fromNothing();

const header = docx.document.headers.add('word/header1.xml', <Paragraph>SKEET HEADER</Paragraph>);
const footer = docx.document.footers.add('word/footer1.xml', <Paragraph>SKEET FOOTER</Paragraph>);

docx.document.set([
	<Section headers={header} footers={footer}>
		<Paragraph>This page has a header and a footer</Paragraph>
	</Section>,
]);

docx.toFile('headers-footers.docx');
