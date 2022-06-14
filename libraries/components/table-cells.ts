import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { asDocxArray, asJsonmlArray } from '../utilities/jsx.ts';
import { ParagraphNode } from './paragraphs.ts';
import { TableNode } from './tables.ts';

type ITableCellOptions = Exclude<ConstructorParameters<typeof docx.TableCell>[0], string>;

export type TableCellProps = Omit<ITableCellOptions, 'children'> & {
	children?: Array<ParagraphNode | TableNode>;
};

export type TableCellNode = AstNode<'TableCell', TableCellProps>;
export type TableCellComponent = DocxComponent<TableCellNode, docx.TableCell>;

/**
 * https://docx.js.org/#/usage/tables?id=table-cell
 */
export const TableCell: TableCellComponent = () => {
	// no-op
};
TableCell.type = 'TableCell';

TableCell.toDocx = async ({ children, ...props }) =>
	new docx.TableCell({
		...props,
		children: await asDocxArray(children),
	});

TableCell.toJsonml = async ({ children }) => ['td', ...(await asJsonmlArray(children))];
