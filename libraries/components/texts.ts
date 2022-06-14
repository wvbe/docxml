import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent, Style } from '../types.ts';
import { asArray } from '../utilities/jsx.ts';

type OneOrMany<P> = P extends Array<infer Q> ? Q | Array<Q> : never;

type IRunOptions = Exclude<ConstructorParameters<typeof docx.TextRun>[0], string>;

export type TextProps = Omit<IRunOptions, 'children' | 'style'> & {
	// string | docx.FootnoteReferenceRun | Begin | FieldInstruction | Separate | End
	children?: OneOrMany<string[]>;
	style?: Style;
};

export type TextNode = AstNode<'Text', TextProps>;
export type TextComponent = DocxComponent<TextNode, docx.TextRun>;

/**
 * The <Text> component
 */
export const Text: TextComponent = () => {
	// no-op
};

Text.type = 'Text';

Text.toDocx = ({ style, children, ...props }) =>
	new docx.TextRun({
		...props,
		style: style?.name,
		children: children === undefined ? children : Array.isArray(children) ? children : [children],
	});

Text.toJsonml = async ({ style, children }) => [
	'span',
	{ ['data-style-name']: style?.name, style },
	(await asArray(children)).join(''),
];

// type IInsertedRunOptions = Exclude<ConstructorParameters<typeof docx.InsertedTextRun>[0], string>;

// export type InsertedTextProps = Omit<IInsertedRunOptions, 'children'> & {
// 	children?: OneOrMany<IInsertedRunOptions['children']>;
// };

// export type InsertedTextNode = AstNode<'InsertedText', docx.InsertedTextRun>;

// /**
//  * The <InsertedText> component
//  */
// export const InsertedText: DocxComponent<InsertedTextProps, InsertedTextNode> = ({
// 	children,
// 	...rest
// }) => {
// 	return {
// 		type: 'InsertedText',
// 		// @TODO type the children that go into Text components
// 		children: [],
// 		docx: new docx.InsertedTextRun({
// 			...rest,
// 			children: children === undefined ? children : Array.isArray(children) ? children : [children],
// 		}),
// 		jsonml: 'zz',
// 	};
// };

// type IDeletedRunOptions = Exclude<ConstructorParameters<typeof docx.DeletedTextRun>[0], string>;

// export type DeletedTextProps = Omit<IDeletedRunOptions, 'children'> & {
// 	children?: OneOrMany<IDeletedRunOptions['children']>;
// };

// export type DeletedTextNode = AstNode<'DeletedText', docx.DeletedTextRun>;

// /**
//  * The <DeletedText> component
//  */
// export const DeletedText: DocxComponent<DeletedTextProps, DeletedTextNode> = ({
// 	children,
// 	...rest
// }) => {
// 	return {
// 		type: 'DeletedText',
// 		// @TODO type the children that go into Text components
// 		children: [],
// 		docx: new docx.DeletedTextRun({
// 			...rest,
// 			children: children === undefined ? children : Array.isArray(children) ? children : [children],
// 		}),
// 		jsonml: 'zz',
// 	};
// };
