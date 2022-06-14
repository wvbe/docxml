import docx from 'https://esm.sh/docx@7.3.0';

import { DocxComponent, DocxNode, Style } from '../types.ts';
import {
	asDocxArray,
	asJsonmlArray,
	assertChildrenAreOnlyOfType,
	guardAgainstInvalidChildren,
} from '../utilities/jsx.ts';
import { TableRowNode } from './table-rows.ts';

type ITableOptions = ConstructorParameters<typeof docx.Table>[0];

export type TableProps = Omit<ITableOptions, 'rows' | 'style'> & {
	children?: Array<DocxNode>;
	style?: Style;
};

export type TableNode = DocxNode<'Table', docx.Table>;

/**
 * The <Table> component
 * https://docx.js.org/#/usage/tables?id=table
 */
export const Table: DocxComponent<TableProps> = async ({ children, style, ...rest }) => {
	await assertChildrenAreOnlyOfType('Table', children, 'TableRow');

	return guardAgainstInvalidChildren<TableRowNode, TableNode>(
		children,
		['TableRow'],
		async (children) => ({
			type: 'Table',
			style,
			children: children || [],
			docx: new docx.Table({
				...rest,
				style: style?.name,
				rows: await asDocxArray(children),
			}),
			jsonml: [
				'table',
				{ ['data-style-name']: style?.name, style },
				['tdbody', ...(await asJsonmlArray(children))],
			],
		}),
	);
};
