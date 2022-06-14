import docx from 'https://esm.sh/docx@7.3.0';

import { DocxComponent, DocxNode } from '../types.ts';
import {
	asDocxArray,
	asJsonmlArray,
	assertChildrenAreOnlyOfType,
	guardAgainstInvalidChildren,
} from '../utilities/jsx.ts';
import { TableCellNode } from './table-cells.ts';

type ITableRowOptions = Exclude<ConstructorParameters<typeof docx.TableRow>[0], string>;

export type TableRowProps = Omit<ITableRowOptions, 'children'> & {
	children?: Array<DocxNode>;
};

export type TableRowNode = DocxNode<'TableRow', docx.TableRow>;

/**
 * https://docx.js.org/#/usage/tables?id=table-row
 */
export const TableRow: DocxComponent<TableRowProps> = async ({ children, ...rest }) => {
	await assertChildrenAreOnlyOfType('TableRow', children, 'TableCell');

	return guardAgainstInvalidChildren<TableCellNode, TableRowNode>(
		children,
		['TableCell'],
		async (children) => ({
			type: 'TableRow',
			children: children || [],
			docx: new docx.TableRow({
				...rest,
				children: await asDocxArray(children),
			}),
			jsonml: ['tr', ...(await asJsonmlArray(children))],
		}),
	);
};
