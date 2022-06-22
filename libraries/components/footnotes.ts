import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode } from '../types.ts';
export type FootnoteReferenceNode = AstNode<
	// Label:
	'FootnoteReference',
	// Props:
	{ id: number },
	// Yield:
	docx.FootnoteReferenceRun
>;

/**
 * The <FootnoteReference> component represents a Word paragraph. Word paragraphs are used to contain most
 * contents, such as text and images.
 */
export const FootnoteReference: AstComponent<FootnoteReferenceNode> = () => {
	// no-op
};

FootnoteReference.type = 'FootnoteReference';

FootnoteReference.children = [];

FootnoteReference.toDocx = ({ id }) => new docx.FootnoteReferenceRun(id);
