import docx from 'https://esm.sh/docx@7.3.0';

import type { Style } from '../classes/style.ts';
import { AstComponent, AstNode } from '../types.ts';

type OneOrMany<P> = P extends Array<infer Q> ? Q | Array<Q> : never;

export type TextNode = AstNode<
	// Label:
	'Text',
	// Props:
	Omit<Exclude<ConstructorParameters<typeof docx.TextRun>[0], string>, 'children' | 'style'> & {
		// string | docx.FootnoteReferenceRun | Begin | FieldInstruction | Separate | End
		children?: OneOrMany<string[]>;
		style?: Style;
	},
	// Yield:
	docx.TextRun
>;

/**
 * The <Text> component
 */
export const Text: AstComponent<TextNode> = () => {
	// no-op
};

Text.type = 'Text';

Text.mixed = true;

Text.children = ['FootnoteReference'];

Text.toDocx = ({ style, children, ...props }) =>
	new docx.TextRun({
		...props,
		style: style?.name,
		children: children === undefined ? children : Array.isArray(children) ? children : [children],
	});

export type InsertedTextNode = AstNode<
	// Label:
	'InsertedText',
	// Props:
	Omit<
		Exclude<ConstructorParameters<typeof docx.InsertedTextRun>[0], string>,
		'children' | 'style'
	> & {
		// string | docx.FootnoteReferenceRun | Begin | FieldInstruction | Separate | End
		children?: OneOrMany<string[]>;
		style?: Style;
	},
	// Yield:
	docx.InsertedTextRun
>;

/**
 * The <InsertedText> component
 */
export const InsertedText: AstComponent<InsertedTextNode> = () => {
	// no-op
};

InsertedText.type = 'InsertedText';

InsertedText.mixed = true;

InsertedText.children = [];

InsertedText.toDocx = ({ style, children, ...props }) =>
	new docx.InsertedTextRun({
		...props,
		style: style?.name,
		children: children === undefined ? children : Array.isArray(children) ? children : [children],
	});

export type DeletedTextNode = AstNode<
	// Label:
	'DeletedText',
	// Props:
	Omit<
		Exclude<ConstructorParameters<typeof docx.DeletedTextRun>[0], string>,
		'children' | 'style'
	> & {
		// string | docx.FootnoteReferenceRun | Begin | FieldInstruction | Separate | End
		children?: OneOrMany<string[]>;
		style?: Style;
	},
	// Yield:
	docx.DeletedTextRun
>;

/**
 * The <DeletedText> component
 */
export const DeletedText: AstComponent<DeletedTextNode> = () => {
	// no-op
};

DeletedText.type = 'DeletedText';

DeletedText.mixed = true;

DeletedText.children = [];

DeletedText.toDocx = ({ style, children, ...props }) =>
	new docx.DeletedTextRun({
		...props,
		style: style?.name,
		children: children === undefined ? children : Array.isArray(children) ? children : [children],
	});
