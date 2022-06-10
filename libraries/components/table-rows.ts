import docx from 'https://esm.sh/docx@7.3.0';

import { asDocxArray, asJsonmlArray, assertChildrenAreOnlyOfType } from '../component-utilities.ts';
import { DocxComponent, DocxNode } from '../types.ts';
import { TableCellNode } from './table-cells.ts';

type ITableRowOptions = Exclude<ConstructorParameters<typeof docx.TableRow>[0], string>;

export type TableRowProps = Omit<ITableRowOptions, 'children'> & {
	children?: TableCellNode[];
};

export type TableRowNode = DocxNode<'TableRow', docx.TableRow>;

/**
 * https://docx.js.org/#/usage/tables?id=table-row
 */ export const TableRow: DocxComponent<TableRowProps, TableRowNode> = async ({
	children,
	...rest
}) => {
	await assertChildrenAreOnlyOfType('TableRow', children, 'TableCell');

	return {
		type: 'TableRow',
		children: children || [],
		docx: new docx.TableRow({
			...rest,
			children: await asDocxArray(children),
		}),
		jsonml: ['tr', ...(await asJsonmlArray(children))],
	};
};
