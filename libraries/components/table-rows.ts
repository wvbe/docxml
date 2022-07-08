import docx from 'https://esm.sh/docx@7.3.0';

import { AstComponent, AstNode } from '../types.ts';
import { TableCellNode } from './table-cells.ts';

export type TableRowNode = AstNode<
	// Label:
	'TableRow',
	// Props:
	Omit<Exclude<ConstructorParameters<typeof docx.TableRow>[0], string>, 'children'> & {
		children?: TableCellNode[];
	},
	// Yield:
	docx.TableRow
>;

/**
 * https://docx.js.org/#/usage/tables?id=table-row
 */
export const TableRow: AstComponent<TableRowNode> = () => {
	// no-op
};

TableRow.type = 'TableRow';

TableRow.children = ['TableCell'];

TableRow.toDocx = ({ children, ...props }) =>
	new docx.TableRow({
		...props,
		children,
	});
