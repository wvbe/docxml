import docx from 'https://esm.sh/docx@7.3.0';

import { asDocxArray, asJsonmlArray, assertChildrenAreOnlyOfType } from '../component-utilities.ts';
import { DocxComponent, DocxNode, Style } from '../types.ts';
import { ImageNode } from './images.tsx';
import { TextNode } from './texts.tsx';

type IParagraphOptions = Exclude<ConstructorParameters<typeof docx.Paragraph>[0], string>;

export type ParagraphProps = Omit<IParagraphOptions, 'children' | 'style'> & {
	children?: Array<TextNode | ImageNode>;
	style?: Style;
};

export type ParagraphNode = DocxNode<'Paragraph', docx.Paragraph>;

/**
 * The <Paragraph> component represents a Word paragraph. Word paragraphs are used to contain most
 * contents, such as text and images.
 */
export const Paragraph: DocxComponent<ParagraphProps, ParagraphNode> = async ({
	children,
	style,
	...rest
}) => {
	await assertChildrenAreOnlyOfType(
		'Paragraph',
		children,
		...['Text', 'Image', 'InsertedText', 'DeletedText'],
	);

	return {
		type: 'Paragraph',
		style,
		children: children || [],
		docx: new docx.Paragraph({
			...rest,
			style: style?.name,
			children: await asDocxArray(children),
		}),
		jsonml: ['p', { ['data-style-name']: style?.name, style }, ...(await asJsonmlArray(children))],
	};
};
