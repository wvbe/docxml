import { create } from '../utilities/dom.ts';
import { type Length } from '../utilities/length.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type Border, type LineBorderType } from './shared-properties.ts';

export type TableCellProperties = {
	colSpan?: null | number;
	rowSpan?: null | number;
	width?: null | Length;
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
};

export function tableCellPropertiesFromNode(node?: Node | null): TableCellProperties {
	return node
		? evaluateXPathToMap(
				`
				let $colStart := ooxml:cell-column(.)

				let $rowStart := count(../../preceding-sibling::${QNS.w}tr)

				(: The first next row that contains a new cell in this column :)
				let $firstNextRow := ../../following-sibling::${QNS.w}tr[
					child::${QNS.w}tc[
						ooxml:cell-column(.) = $colStart and
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
				(: NB; Used to -1 the "else" scenario :)

				return map {
					"colSpan": if (./${QNS.w}gridSpan)
						then ./${QNS.w}gridSpan/@${QNS.w}val/number()
						else 1,
					"rowSpan": $rowEnd - $rowStart,
					"borders": ./${QNS.w}tcBorders/map {
						"top": ./${QNS.w}top/ooxml:border(.),
						"start": ./${QNS.w}start/ooxml:border(.),
						"bottom": ./${QNS.w}bottom/ooxml:border(.),
						"end": ./${QNS.w}end/ooxml:border(.),
						"tl2br": ./${QNS.w}tl2br/ooxml:border(.),
						"tr2bl": ./${QNS.w}tr2bl/ooxml:border(.),
						"insideH": ./${QNS.w}insideH/ooxml:border(.),
						"insideV": ./${QNS.w}insideV/ooxml:border(.)
					}
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
			if (exists($borders)) then element ${QNS.w}tcBorders {
				(: In sequence order: :)
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "start"), $borders('start')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "end"), $borders('end')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "tl2br"), $borders('tl2br')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "tr2bl"), $borders('tr2bl')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
				ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
			} else ()
		}`,
		{
			asRepeatingNode: !!asRepeatingNode,
			colSpan: tcpr.colSpan || 1,
			rowSpan: tcpr.rowSpan || 1,
			width: tcpr.width ? Math.round(tcpr.width.twip) : null,
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
