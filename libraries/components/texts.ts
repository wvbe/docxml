import docx from 'https://esm.sh/docx@7.3.0';

import { DocxComponent, DocxNode, Style } from '../types.ts';
import { asArray } from '../utilities/jsx.ts';

type OneOrMany<P> = P extends Array<infer Q> ? Q | Array<Q> : never;

type IRunOptions = Exclude<ConstructorParameters<typeof docx.TextRun>[0], string>;

export type TextProps = Omit<IRunOptions, 'children' | 'style'> & {
	children?: OneOrMany<IRunOptions['children']>;
	style?: Style;
};

export type TextNode = DocxNode<'Text', docx.TextRun>;

/**
 * The <Text> component
 */
export const Text: DocxComponent<TextProps, TextNode> = async ({ children, style, ...rest }) => {
	return {
		type: 'Text',
		style,
		// @TODO type the children that go into Text components
		children: [],
		docx: new docx.TextRun({
			...rest,
			style: style?.name,
			children: children === undefined ? children : Array.isArray(children) ? children : [children],
		}),
		//  @TODO
		jsonml: [
			'span',
			{ ['data-style-name']: style?.name, style },
			(await asArray(children)).join(''),
		],
	};
};

type IInsertedRunOptions = Exclude<ConstructorParameters<typeof docx.InsertedTextRun>[0], string>;

export type InsertedTextProps = Omit<IInsertedRunOptions, 'children'> & {
	children?: OneOrMany<IInsertedRunOptions['children']>;
};

export type InsertedTextNode = DocxNode<'InsertedText', docx.InsertedTextRun>;

/**
 * The <InsertedText> component
 */
export const InsertedText: DocxComponent<InsertedTextProps, InsertedTextNode> = ({
	children,
	...rest
}) => {
	return {
		type: 'InsertedText',
		// @TODO type the children that go into Text components
		children: [],
		docx: new docx.InsertedTextRun({
			...rest,
			children: children === undefined ? children : Array.isArray(children) ? children : [children],
		}),
		jsonml: 'zz',
	};
};

type IDeletedRunOptions = Exclude<ConstructorParameters<typeof docx.DeletedTextRun>[0], string>;

export type DeletedTextProps = Omit<IDeletedRunOptions, 'children'> & {
	children?: OneOrMany<IDeletedRunOptions['children']>;
};

export type DeletedTextNode = DocxNode<'DeletedText', docx.DeletedTextRun>;

/**
 * The <DeletedText> component
 */
export const DeletedText: DocxComponent<DeletedTextProps, DeletedTextNode> = ({
	children,
	...rest
}) => {
	return {
		type: 'DeletedText',
		// @TODO type the children that go into Text components
		children: [],
		docx: new docx.DeletedTextRun({
			...rest,
			children: children === undefined ? children : Array.isArray(children) ? children : [children],
		}),
		jsonml: 'zz',
	};
};
