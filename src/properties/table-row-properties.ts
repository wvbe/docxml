import { create } from '../utilities/dom.ts';
import { type Length } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

export type TableRowProperties = {
	/**
	 * Specifies that the current row should be repeated at the top each new page on which the table
	 * is displayed. This can be specified for multiple rows to generate a multi-row header. Note
	 * that if the row is not the first row, then the property will be ignored.
	 */
	isHeaderRow?: null | boolean;
	/**
	 * If `true`, it prevents the contents of the row from breaking across multiple pages by moving
	 * the start of the row to the start of a new page. If the contents cannot fit on a single page,
	 * the row will start on a new page and flow onto multiple pages.
	 */
	isUnsplittable?: null | boolean;
	/**
	 * The distance between cells.
	 */
	cellSpacing?: null | Length;
};

export function tableRowPropertiesFromNode(node?: Node | null): TableRowProperties {
	return node
		? evaluateXPathToMap<TableRowProperties>(
				`map {
					"isHeaderRow": docxml:ct-on-off(./${QNS.w}tblHeader),
					"isUnsplittable": docxml:ct-on-off(./${QNS.w}cantSplit),
					"cellSpacing": docxml:length(${QNS.w}tblCellSpacing[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip')
				}`,
				node,
		  )
		: {};
}

export function tableRowPropertiesToNode(tcpr: TableRowProperties = {}): Node | null {
	if (!Object.keys(tcpr).length) {
		return null;
	}
	return create(
		`element ${QNS.w}trPr {
			if ($isHeaderRow) then element ${QNS.w}tblHeader {} else (),
			if ($isUnsplittable) then element ${QNS.w}cantSplit {} else (),
			if (exists($cellSpacing)) then element ${QNS.w}tblCellSpacing {
				attribute ${QNS.w}w { $cellSpacing('twip') },
				attribute ${QNS.w}type { "dxa" }
			} else ()
		}`,
		{
			isHeaderRow: tcpr.isHeaderRow || false,
			isUnsplittable: tcpr.isUnsplittable || false,
			cellSpacing: tcpr.cellSpacing || null,
		},
	);
}
