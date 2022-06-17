import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode } from '../types.ts';
import { ParagraphNode } from './paragraphs.ts';
import { TableNode } from './tables.ts';

export type SectionNode = AstNode<
	// Label:
	'Section',
	// Props:
	Omit<docx.ISectionOptions, 'children'> & {
		// @TODO allow TableOfContents into children too
		children?: Array<ParagraphNode | TableNode>;
	},
	// Yield:
	docx.ISectionOptions
>;

/**
 * The <Section> component represents one or more pages in a MS Word document. Each section can be
 * given different properties such as size and orientation.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/sections
 */
export const Section: AstComponent<SectionNode> = () => {
	// no-op
};

Section.type = 'Section';

Section.children = ['Paragraph', 'Table'];

Section.toDocx = ({ children, ...props }) => ({
	...props,
	children,
});
