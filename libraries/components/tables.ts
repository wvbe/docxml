import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent, Style } from '../types.ts';
import { asDocxArray, asJsonmlArray } from '../utilities/jsx.ts';
import { TableRowNode } from './table-rows.ts';

type ITableOptions = ConstructorParameters<typeof docx.Table>[0];

export type TableProps = Omit<ITableOptions, 'rows' | 'style'> & {
	children?: TableRowNode[];
	style?: Style;
};

export type TableNode = AstNode<'Table', TableProps>;
export type TableComponent = DocxComponent<TableNode, docx.Table>;

/**
 * The <Table> component
 * https://docx.js.org/#/usage/tables?id=table
 */
export const Table: TableComponent = () => {
	// no-op
};

Table.type = 'Table';

Table.toDocx = async ({ children, style, ...props }) =>
	new docx.Table({
		...props,
		style: style?.name,
		rows: await asDocxArray(children),
	});

Table.toJsonml = async ({ children, style }) => [
	'table',
	{ ['data-style-name']: style?.name, style },
	['tdbody', ...(await asJsonmlArray(children))],
];
