import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode } from '../types.ts';
import { SectionNode } from './sections.ts';

type IPropertiesOptions = ConstructorParameters<typeof docx.Document>[0];

export type DocumentNode = AstNode<
	// Label:
	'Document',
	// Props:
	Omit<IPropertiesOptions, 'sections' | 'externalStyles'> & {
		children?: SectionNode[];
		template?: string | undefined;
	},
	// Yield:
	docx.Document
>;

/**
 * The <Document> component represents one DOCX document. There is only one per .docx file, and
 * (aside from some options) it only accepts <Section> children.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/document
 */

export const Document: AstComponent<DocumentNode> = () => {
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
