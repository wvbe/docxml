import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { asDocxArray, asJsonmlArray } from '../utilities/jsx.ts';
import { SectionNode } from './sections.ts';

type IPropertiesOptions = ConstructorParameters<typeof docx.Document>[0];

export type DocumentProps = Omit<IPropertiesOptions, 'sections' | 'externalStyles'> & {
	children?: SectionNode[];
	template?: string | undefined;
};

export type DocumentNode = AstNode<'Document', DocumentProps>;
export type DocumentComponent = DocxComponent<DocumentNode, docx.Document>;

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

Document.toDocx = async ({ children, template, ...props }) =>
	new docx.Document({
		externalStyles: await template,
		...props,
		sections: await asDocxArray(children),
	});

Document.toJsonml = async ({ children }) => [
	'html',
	['head', ['title', new Date().toISOString()]],
	['body', ...(await asJsonmlArray(children))],
];
