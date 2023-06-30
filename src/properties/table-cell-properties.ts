import { create } from '../utilities/dom.ts';
import { type Length } from '../utilities/length.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type Border, type LineBorderType, type Shading } from './shared-properties.ts';

export type TableCellProperties = {
	/**
	 * The amount of columns spanned by this cell. Defaults to `1`.
	 */
	colSpan?: null | number;
	/**
	 * The amount of rows spanned by this cell. Defaults to `1`.
	 */
	rowSpan?: null | number;
	/**
	 * The width of this cell.
	 */
	width?: null | Length;
	/**
	 * The background color of this cell, optionally with a pattern in a secondary color.
	 */
	shading?: null | Shading;
	/**
	 * The border on any side of this cell, or between diagonally across in either direction.
	 */
	borders?: null | {
		top?: null | Border<LineBorderType>;
		start?: null | Border<LineBorderType>;
		bottom?: null | Border<LineBorderType>;
		end?: null | Border<LineBorderType>;
		insideH?: null | Border<LineBorderType>;
		insideV?: null | Border<LineBorderType>;
		/**
		 * Diagonally from top-left to bottom-right. Like a backward slash.
		 */
		tl2br?: null | Border<LineBorderType>;
		/**
		 * Diagonally from top-right to bottom-left. Like a forward slash.
		 */
		tr2bl?: null | Border<LineBorderType>;
	};
	/**
	 * The vertical alignment of this cell.
	 */
	verticalAlignment?: null | 'bottom' | 'center' | 'top';
};

export function tableCellPropertiesFromNode(node?: Node | null): TableCellProperties {
	return node
		? evaluateXPathToMap<TableCellProperties>(
				`
				let $colStart := docxml:cell-column(.)

				let $rowStart := count(../../preceding-sibling::${QNS.w}tr)

				(: The first next row that contains a new cell in this column :)
				let $firstNextRow := ../../following-sibling::${QNS.w}tr[
					child::${QNS.w}tc[
						docxml:cell-column(.) = $colStart and
						not(
							./${QNS.w}tcPr/${QNS.w}vMerge[
								@${QNS.w}val = "continue" or
								not(./@${QNS.w}val)
							]
						)
					]
				][1]

				let $rowEnd := if ($firstNextRow)
					then count($firstNextRow/preceding-sibling::${QNS.w}tr)
					else count(../../../${QNS.w}tr)

				return map {
					"colSpan": if (./${QNS.w}gridSpan)
						then ./${QNS.w}gridSpan/@${QNS.w}val/number()
						else 1,
					"rowSpan": if ($rowEnd != $rowStart)
						then $rowEnd - $rowStart
						else 1,
					"shading": ./${QNS.w}shd/docxml:ct-shd(.),
					"borders": ./${QNS.w}tcBorders/map {
						"top": docxml:ct-border(${QNS.w}top),
						"start": docxml:ct-border((${QNS.w}start|${QNS.w}left)[1]),
						"bottom": docxml:ct-border(${QNS.w}bottom),
						"end": docxml:ct-border((${QNS.w}end|${QNS.w}right)[1]),
						"tl2br": docxml:ct-border(${QNS.w}tl2br),
						"tr2bl": docxml:ct-border(${QNS.w}tr2bl),
						"insideH": docxml:ct-border(${QNS.w}insideH),
						"insideV": docxml:ct-border(${QNS.w}insideV)
					},
					"verticalAlignment": ./${QNS.w}vAlign/@${QNS.w}val/string()
				}
				`,
				node,
		  )
		: {};
}

export function tableCellPropertiesToNode(
	tcpr: TableCellProperties = {},
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
			} else (),
			if (exists($verticalAlignment)) then element ${QNS.w}vAlign {
				attribute ${QNS.w}val { $verticalAlignment }
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
			verticalAlignment: tcpr.verticalAlignment || null
		},
	);
}
