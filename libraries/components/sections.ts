import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { ParagraphNode } from './paragraphs.ts';
import { TableNode } from './tables.ts';

export type SectionProps = Omit<docx.ISectionOptions, 'children'> & {
	// @TODO allow TableOfContents into children too
	children?: Array<ParagraphNode | TableNode>;
};

export type SectionNode = AstNode<'Section', SectionProps, docx.ISectionOptions>;
export type SectionComponent = DocxComponent<SectionNode>;

/**
 * The <Section> component represents one or more pages in a MS Word document. Each section can be
 * given different properties such as size and orientation.
 *
 * More info on its options:
 *   https://docx.js.org/#/usage/sections
 */
export const Section: SectionComponent = () => {
	// no-op
};

Section.type = 'Section';

Section.children = ['Paragraph', 'Table'];

Section.toDocx = ({ children, ...props }) => ({
	...props,
	children,
});
