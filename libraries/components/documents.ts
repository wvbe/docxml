import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode } from '../types.ts';
import { getDocxTree } from '../utilities/jsx.ts';
import { ParagraphNode } from './paragraphs.ts';
import { SectionNode } from './sections.ts';

type IPropertiesOptions = ConstructorParameters<typeof docx.Document>[0];

export type DocumentNode = AstNode<
	// Label:
	'Document',
	// Props:
	Omit<IPropertiesOptions, 'sections' | 'externalStyles' | 'footnotes'> & {
		footnotes?: Record<string, ParagraphNode[]>;
		children?: SectionNode[];
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

Document.toDocx = async ({ children, footnotes: footnoteAstMap, ...props }, application) => {
	const footnotes =
		footnoteAstMap &&
		(await Object.keys(footnoteAstMap).reduce(
			async (fns, id) => ({
				...fns,
				[id]: {
					children: await Promise.all(footnoteAstMap[id].map((x) => getDocxTree(x, application))),
				},
			}),
			Promise.resolve({}),
		));
	const templateMixin = await application.template.init();
	return new docx.Document({
		...templateMixin,
		footnotes,
		...props,
		sections: children,
	});
};
