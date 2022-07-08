import docx from 'https://esm.sh/docx@7.3.0';

import type { Style } from '../classes/style.ts';
import { AstComponent, AstNode } from '../types.ts';
import { TableRowNode } from './table-rows.ts';

export type TableNode = AstNode<
	// Label:
	'Table',
	// Props:
	Omit<ConstructorParameters<typeof docx.Table>[0], 'rows' | 'style'> & {
		children?: TableRowNode[];
		style?: Style;
	},
	// Yield:
	docx.Table
>;

/**
 * The <Table> component
 * https://docx.js.org/#/usage/tables?id=table
 */
export const Table: AstComponent<TableNode> = () => {
	// no-op
};

Table.type = 'Table';
Table.children = ['TableRow'];

Table.toDocx = ({ children, style, ...props }) =>
	new docx.Table({
		...props,
		style: style?.name,
		rows: children,
	});
