import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { TableCellNode } from './table-cells.ts';

type ITableRowOptions = Exclude<ConstructorParameters<typeof docx.TableRow>[0], string>;

export type TableRowProps = Omit<ITableRowOptions, 'children'> & {
	children?: TableCellNode[];
};

export type TableRowNode = AstNode<'TableRow', TableRowProps, docx.TableRow>;
export type TableRowComponent = DocxComponent<TableRowNode>;

/**
 * https://docx.js.org/#/usage/tables?id=table-row
 */
export const TableRow: TableRowComponent = () => {
	// no-op
};

TableRow.type = 'TableRow';

TableRow.children = ['TableCell'];

TableRow.toDocx = ({ children, ...props }) =>
	new docx.TableRow({
		...props,
		children,
	});

// TableRow.toJsonml = async ({ children }) => ['tr', ...(await asJsonmlArray(children))];
