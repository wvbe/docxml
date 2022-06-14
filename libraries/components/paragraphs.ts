import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent, Style } from '../types.ts';
import { asDocxArray, asJsonmlArray } from '../utilities/jsx.ts';
import { ImageNode } from './images.ts';
import { TextNode } from './texts.ts';

type IParagraphOptions = Exclude<ConstructorParameters<typeof docx.Paragraph>[0], string>;

export type ParagraphProps = Omit<IParagraphOptions, 'children' | 'style'> & {
	children?: Array<TextNode | ImageNode>;
	style?: Style;
};
export type ParagraphNode = AstNode<'Paragraph', ParagraphProps>;
export type ParagraphComponent = DocxComponent<ParagraphNode, docx.Paragraph>;

/**
 * The <Paragraph> component represents a Word paragraph. Word paragraphs are used to contain most
 * contents, such as text and images.
 */
export const Paragraph: ParagraphComponent = () => {
	// no-op
};

Paragraph.type = 'Paragraph';

Paragraph.toDocx = async ({ children, style, ...props }) =>
	new docx.Paragraph({
		...props,
		style: style?.name,
		children: await asDocxArray(children),
	});

Paragraph.toJsonml = async ({ style, children }) => [
	'p',
	{ ['data-style-name']: style?.name, style },
	...(await asJsonmlArray(children)),
];
