import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { asDocxArray, asJsonmlArray } from '../utilities/jsx.ts';
import { TableCellNode } from './table-cells.ts';

type ITableRowOptions = Exclude<ConstructorParameters<typeof docx.TableRow>[0], string>;

export type TableRowProps = Omit<ITableRowOptions, 'children'> & {
	children?: TableCellNode[];
};

export type TableRowNode = AstNode<'TableRow', TableRowProps>;
export type TableRowComponent = DocxComponent<TableRowNode, docx.TableRow>;

/**
 * https://docx.js.org/#/usage/tables?id=table-row
 */
export const TableRow: TableRowComponent = () => {
	// no-op
};

TableRow.type = 'TableRow';

TableRow.toDocx = async ({ children, ...props }) =>
	new docx.TableRow({
		...props,
		children: await asDocxArray(children),
	});

TableRow.toJsonml = async ({ children }) => ['tr', ...(await asJsonmlArray(children))];
