import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent, Style } from '../types.ts';
import { ImageNode } from './images.ts';
import { TextNode } from './texts.ts';

type IParagraphOptions = Exclude<ConstructorParameters<typeof docx.Paragraph>[0], string>;

export type ParagraphProps = Omit<IParagraphOptions, 'children' | 'style'> & {
	children?: Array<TextNode | ImageNode>;
	style?: Style;
};
export type ParagraphNode = AstNode<'Paragraph', ParagraphProps, docx.Paragraph>;
export type ParagraphComponent = DocxComponent<ParagraphNode>;

/**
 * The <Paragraph> component represents a Word paragraph. Word paragraphs are used to contain most
 * contents, such as text and images.
 */
export const Paragraph: ParagraphComponent = () => {
	// no-op
};

Paragraph.type = 'Paragraph';

Paragraph.children = ['Text', 'Image', 'InsertedText', 'DeletedText'];

Paragraph.toDocx = ({ children, style, ...props }) =>
	new docx.Paragraph({
		...props,
		style: style?.name,
		children: children,
	});

// Paragraph.toJsonml = ({ style, children }) => [
// 	'p',
// 	{ ['data-style-name']: style?.name, style },
// 	...children,
// ];
