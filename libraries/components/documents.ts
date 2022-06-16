import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { SectionNode } from './sections.ts';

type IPropertiesOptions = ConstructorParameters<typeof docx.Document>[0];

export type DocumentProps = Omit<IPropertiesOptions, 'sections' | 'externalStyles'> & {
	children?: SectionNode[];
	template?: string | undefined;
};

export type DocumentNode = AstNode<'Document', DocumentProps, docx.Document>;
export type DocumentComponent = DocxComponent<DocumentNode>;

/**
 * The <Document> component represents one DOCX document. There is only one per .docx file, and
 * (aside from some options) it only accepts <Section> children.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/document
 */

export const Document: DocumentComponent = () => {
	// no-op
};

Document.type = 'Document';

Document.children = ['Section'];

Document.toDocx = async ({ children, template, ...props }) =>
	new docx.Document({
		externalStyles: await template,
		...props,
		sections: children,
	});

// Document.toJsonml = ({ children }) => [
// 	'html',
// 	['head', ['title', new Date().toISOString()]],
// 	['body', ...children],
// ];
