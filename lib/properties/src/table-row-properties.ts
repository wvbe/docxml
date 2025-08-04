import { Insertion, type InsertionProps } from '../../../mod.ts';
import { create } from '../../utilities/src/dom.ts';
import type { Length } from '../../utilities/src/length.ts';
import { QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';

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
	/**
	 * A property used to indicate when a row has been inserted.
	 *
	 * If present, the containing row element will appear as a track-change inserted row.
	 *
	 * Read more here: https://c-rex.net/samples/ooxml/e1/Part4/OOXML_P4_DOCX_ins_topic_ID0EA14V.html
	 */
	insertion?: null | InsertionProps;
};

export function tableRowPropertiesFromNode(
	node?: Node | null
): TableRowProperties {
	const props = node
		? evaluateXPathToMap<TableRowProperties>(
				`map {
					"isHeaderRow": docxml:ct-on-off(./${QNS.w}tblHeader),
					"isUnsplittable": docxml:ct-on-off(./${QNS.w}cantSplit),
					"cellSpacing": docxml:length(${QNS.w}tblCellSpacing[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
					"insertion": ./${QNS.w}ins/map {
						"id": @${QNS.w}id/number(), 
						"author": @${QNS.w}author/string(), 
						"date": @${QNS.w}date/string()
					}
				}`,
				node
		  )
		: {};

	if (props.insertion) {
		// Convert the date string to a Date object.
		props.insertion.date = props.insertion.date
			? new Date(props.insertion.date)
			: undefined;
		props.insertion.author = props.insertion.author
			? props.insertion.author
			: undefined;
	}

	return props;
}

export async function tableRowPropertiesToNode(
	tcpr: TableRowProperties = {}
): Promise<Node | null> {
	if (!Object.keys(tcpr).length) {
		return null;
	}
	return create(
		`element ${QNS.w}trPr {
			if ($isHeaderRow) then element ${QNS.w}tblHeader {} else (),
			if ($isUnsplittable) then element ${QNS.w}cantSplit {} else (),
			if (exists($cellSpacing)) then element ${QNS.w}tblCellSpacing {
				attribute ${QNS.w}w { round($cellSpacing('twip')) },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			$insertion
		}`,
		{
			isHeaderRow: tcpr.isHeaderRow || false,
			isUnsplittable: tcpr.isUnsplittable || false,
			cellSpacing: tcpr.cellSpacing || null,
			insertion: tcpr.insertion
				? await new Insertion(tcpr.insertion).toNode([])
				: null,
		}
	);
}
