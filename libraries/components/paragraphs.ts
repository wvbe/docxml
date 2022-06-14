import docx from 'https://esm.sh/docx@7.3.0';

import { DocxComponent, DocxNode, Style } from '../types.ts';
import {
	asDocxArray,
	asJsonmlArray,
	assertChildrenAreOnlyOfType,
	guardAgainstInvalidChildren,
} from '../utilities/jsx.ts';
import { ImageNode } from './images.ts';
import { TextNode } from './texts.ts';

type IParagraphOptions = Exclude<ConstructorParameters<typeof docx.Paragraph>[0], string>;

export type ParagraphProps = Omit<IParagraphOptions, 'children' | 'style'> & {
	children?: Array<DocxNode>;
	style?: Style;
};

export type ParagraphNode = DocxNode<'Paragraph', docx.Paragraph>;

/**
 * The <Paragraph> component represents a Word paragraph. Word paragraphs are used to contain most
 * contents, such as text and images.
 */
export const Paragraph: DocxComponent<ParagraphProps> = async ({ children, style, ...rest }) => {
	await assertChildrenAreOnlyOfType(
		'Paragraph',
		children,
		...['Text', 'Image', 'InsertedText', 'DeletedText'],
	);

	return guardAgainstInvalidChildren<ImageNode | TextNode, ParagraphNode>(
		children,
		['Text', 'Image', 'InsertedText', 'DeletedText'],
		async (children) => ({
			type: 'Paragraph',
			style,
			children: children || [],
			docx: new docx.Paragraph({
				...rest,
				style: style?.name,
				children: await asDocxArray(children),
			}),
			jsonml: [
				'p',
				{ ['data-style-name']: style?.name, style },
				...(await asJsonmlArray(children)),
			],
		}),
	);
};
