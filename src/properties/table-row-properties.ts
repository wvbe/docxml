import { create } from '../utilities/dom.ts';
import { type Length } from '../utilities/length.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
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
	 * Specifies the height of the row. If omitted, the row is automatically resized to fit the content.
	 */
	height?: null | Length;
	/**
	 * The distance between cells.
	 */
	cellSpacing?: null | Length;
};

export function tableCellPropertiesFromNode(node?: Node | null): TableRowProperties {
	return node
		? evaluateXPathToMap<TableRowProperties>(
				`map {
					"isHeaderRow": docxml:ct-on-off(./${QNS.w}tblHeader),
					"rowSpan": if ($rowEnd != $rowStart)
						then $rowEnd - $rowStart
						else 1,
					"shading": ./${QNS.w}shd/docxml:ct-shd(.),
					"borders": ./${QNS.w}tcBorders/map {
						"top": docxml:ct-border(${QNS.w}top),
						"start": docxml:ct-border(${QNS.w}start),
						"bottom": docxml:ct-border(${QNS.w}bottom),
						"end": docxml:ct-border(${QNS.w}end),
						"tl2br": docxml:ct-border(${QNS.w}tl2br),
						"tr2bl": docxml:ct-border(${QNS.w}tr2bl),
						"insideH": docxml:ct-border(${QNS.w}insideH),
						"insideV": docxml:ct-border(${QNS.w}insideV)
					}
				}`,
				node,
		  )
		: {};
}

export function tableCellPropertiesToNode(
	tcpr: TableRowProperties = {},
	asRepeatingNode: boolean,
): Node {
	return create(
		`element ${QNS.w}tcPr {
			if ($width) then element ${QNS.w}tcW {
				attribute ${QNS.w}w { $width },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if ($colSpan > 1) then element ${QNS.w}gridSpan {
				attribute ${QNS.w}val { $colSpan }
			} else (),
			if ($asRepeatingNode) then element ${QNS.w}vMerge {
				attribute ${QNS.w}val { "continue" }
			} else (
				if ($rowSpan > 1) then element ${QNS.w}vMerge {
					attribute ${QNS.w}val { "restart" }
				} else ()
			),
			docxml:ct-shd(fn:QName("${NamespaceUri.w}", "shd"), $shading),
			if (exists($borders)) then element ${QNS.w}tcBorders {
				(: In sequence order: :)
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "start"), $borders('start')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "end"), $borders('end')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "tl2br"), $borders('tl2br')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "tr2bl"), $borders('tr2bl')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
			} else ()
		}`,
		{
			asRepeatingNode: !!asRepeatingNode,
			colSpan: tcpr.colSpan || 1,
			rowSpan: tcpr.rowSpan || 1,
			width: tcpr.width ? Math.round(tcpr.width.twip) : null,
			shading: tcpr.shading || null,
			borders: tcpr.borders
				? {
						top: null,
						left: null,
						bottom: null,
						right: null,
						insideH: null,
						insideV: null,
						tl2br: null,
						tr2bl: null,
						...tcpr.borders,
				  }
				: null,
		},
	);
}
