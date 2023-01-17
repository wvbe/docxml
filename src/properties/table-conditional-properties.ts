import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import {
	type TableCellProperties,
	tableCellPropertiesFromNode,
	tableCellPropertiesToNode,
} from './table-cell-properties.ts';

export type TableConditionalTypes =
	// The formatting applies to odd numbered groupings of rows
	| 'band1Horz'
	// The formatting applies to odd numbered groupings of columns
	| 'band1Vert'
	// The formatting applies to even numbered groupings of rows
	| 'band2Horz'
	// The formatting applies to even numbered groupings of columns
	| 'band2Vert'
	// The formatting applies to the first column
	| 'firstCol'
	// The formatting applies to the first row
	| 'firstRow'
	// The formatting applies to the last column
	| 'lastCol'
	// The formatting applies to the last row
	| 'lastRow'
	// The formatting applies to the top right cell
	| 'neCell'
	// The formatting applies to the top left cell
	| 'nwCell'
	// The formatting applies to the bottom right cell
	| 'seCell'
	// The formatting applies to the bottom left cell
	| 'swCell'
	// The formatting applies to the whole table
	| 'wholeTable';
/**
 * The typing for <w:tblStylePr>
 *
 * @see http://www.datypic.com/sc/ooxml/e-w_tblStylePr-1.html
 */
export type TableConditionalProperties = {
	type: TableConditionalTypes;
	cells?: null | TableCellProperties;
};

export function tableConditionalPropertiesFromNode(node: Node): TableConditionalProperties {
	const { tcPr, ...rest } = evaluateXPathToMap<{
		type: TableConditionalTypes;
		tcPr?: Element;
	}>(
		`map {
			"type": ./@${QNS.w}type/string(),
			"tcPr": ./${QNS.w}tcPr
		}`,
		node,
	);

	const properties: TableConditionalProperties = {
		...rest,
		cells: tcPr ? tableCellPropertiesFromNode(tcPr) : null,
	};

	return properties;
}

export function tableConditionalPropertiesToNode(tblpr: TableConditionalProperties): Node {
	return create(
		`element ${QNS.w}tblStylePr {
			attribute ${QNS.w}type { $type },
			$tcPr
		}`,
		{
			...tblpr,
			tcPr: tblpr.cells ? tableCellPropertiesToNode(tblpr.cells, false) : null,
		},
	);
}
