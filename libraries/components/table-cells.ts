import docx from 'https://esm.sh/docx@7.3.0';

import { AstNode, DocxComponent } from '../types.ts';
import { ParagraphNode } from './paragraphs.ts';
import { TableNode } from './tables.ts';

type ITableCellOptions = Exclude<ConstructorParameters<typeof docx.TableCell>[0], string>;

export type TableCellProps = Omit<ITableCellOptions, 'children'> & {
	children?: Array<ParagraphNode | TableNode>;
};

export type TableCellNode = AstNode<'TableCell', TableCellProps, docx.TableCell>;

export type TableCellComponent = DocxComponent<TableCellNode>;

/**
 * https://docx.js.org/#/usage/tables?id=table-cell
 */
export const TableCell: TableCellComponent = () => {
	// no-op
};
TableCell.type = 'TableCell';

TableCell.children = ['Paragraph', 'Table'];

TableCell.toDocx = ({ children, ...props }) =>
	new docx.TableCell({
		...props,
		children,
	});

// TableCell.toJsonml = async ({ children }) => ['td', ...(await asJsonmlArray(children))];
