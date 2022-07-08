import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode } from '../types.ts';
import { ParagraphNode } from './paragraphs.ts';
import { TableNode } from './tables.ts';

type ITableCellOptions = Exclude<ConstructorParameters<typeof docx.TableCell>[0], string>;

export type TableCellNode = AstNode<
	// Label:
	'TableCell',
	// Props:
	Omit<ITableCellOptions, 'children'> & {
		children?: Array<ParagraphNode | TableNode>;
	},
	// Yield:
	docx.TableCell
>;

/**
 * https://docx.js.org/#/usage/tables?id=table-cell
 */
export const TableCell: AstComponent<TableCellNode> = () => {
	// no-op
};
TableCell.type = 'TableCell';

TableCell.children = ['Paragraph', 'Table'];

TableCell.toDocx = ({ children, ...props }) =>
	new docx.TableCell({
		...props,
		children,
	});
