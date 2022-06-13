import docx from 'https://esm.sh/docx@7.3.0';

import { DocxComponent, DocxNode } from '../types.ts';
import { asDocxArray, asJsonmlArray, assertChildrenAreOnlyOfType } from '../utilities/jsx.ts';
import { SectionNode } from './sections.ts';

type IPropertiesOptions = ConstructorParameters<typeof docx.Document>[0];

export type DocumentProps = Omit<IPropertiesOptions, 'sections' | 'externalStyles'> & {
	children?: SectionNode[];
	template?: string | undefined;
};

export type DocumentNode = DocxNode<'Document', docx.Document>;

/**
 * The <Document> component represents one DOCX document. There is only one per .docx file, and
 * (aside from some options) it only accepts <Section> children.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/document
 */
export const Document: DocxComponent<DocumentProps, DocumentNode> = async ({
	children,
	template,
	...rest
}) => {
	await assertChildrenAreOnlyOfType('Document', children, 'Section');

	return {
		type: 'Document',
		children: children || [],
		docx: new docx.Document({
			externalStyles: await template,
			...rest,
			sections: await asDocxArray(children),
		}),
		jsonml: [
			'html',
			['head', ['title', new Date().toISOString()]],
			['body', ...(await asJsonmlArray(children))],
		],
	};
};
