import docx from 'https://esm.sh/docx@7.3.0';

import { asDocxArray, asJsonmlArray, assertChildrenAreOnlyOfType } from '../component-utilities.ts';
import { DocxComponent, DocxNode } from '../types.ts';
import { ParagraphNode } from './paragraphs.ts';
import { TableNode } from './tables.ts';

type ITableCellOptions = Exclude<ConstructorParameters<typeof docx.TableCell>[0], string>;

export type TableCellProps = Omit<ITableCellOptions, 'children'> & {
	children?: Array<ParagraphNode | TableNode>;
};

export type TableCellNode = DocxNode<'TableCell', docx.TableCell>;

/**
 * https://docx.js.org/#/usage/tables?id=table-cell
 */
export const TableCell: DocxComponent<TableCellProps, TableCellNode> = async ({
	children,
	...rest
}) => {
	await assertChildrenAreOnlyOfType('TableCell', children, 'Paragraph', 'Table');

	return {
		type: 'TableCell',
		children: children || [],
		docx: new docx.TableCell({
			...rest,
			children: await asDocxArray(children),
		}),
		jsonml: ['td', ...(await asJsonmlArray(children))],
	};
};
