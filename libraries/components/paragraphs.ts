import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode, Style } from '../types.ts';
import { ImageNode } from './images.ts';
import { TextNode } from './texts.ts';

type IParagraphOptions = Exclude<ConstructorParameters<typeof docx.Paragraph>[0], string>;

export type ParagraphNode = AstNode<
	// Label:
	'Paragraph',
	// Props:
	Omit<IParagraphOptions, 'children' | 'style'> & {
		children?: Array<TextNode | ImageNode>;
		style?: Style;
	},
	// Yield:
	docx.Paragraph
>;

/**
 * The <Paragraph> component represents a Word paragraph. Word paragraphs are used to contain most
 * contents, such as text and images.
 */
export const Paragraph: AstComponent<ParagraphNode> = () => {
	// no-op
};

Paragraph.type = 'Paragraph';

Paragraph.children = ['Text', 'Image', 'InsertedText', 'DeletedText', 'FootnoteReference'];

Paragraph.toDocx = ({ children, style, ...props }) =>
	new docx.Paragraph({
		...props,
		style: style?.name,
		children: children,
	});
