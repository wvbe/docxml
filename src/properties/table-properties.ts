import { create } from '../utilities/dom.ts';
import { Length } from '../utilities/length.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type ArtBorderType, type Border, type LineBorderType } from './shared-properties.ts';

export type TableProperties = {
	style?: string | null;
	/**
	 * @deprecated Use columnWidths instead. Also, this API sucks.
	 */
	width?:
		| null
		| number
		| '`${number}%'
		| string
		| {
				length: '`${number}%' | string | number;
				unit: null | 'nil' | 'auto' | 'dxa' | 'pct';
		  };
	/**
	 * The distance with which this table is indented from the left page boundary.
	 */
	indentation?: null | Length;
	/**
	 * The distance between cells.
	 */
	cellSpacing?: null | Length;
	/**
	 * If banding is used, specifies how many rows constitute one banded group.
	 */
	rowBandingSize?: null | number;
	/**
	 * If banding is used, specifies how many columns constitute one banded group.
	 */
	columnBandingSize?: null | number;
	/**
	 * @todo rename to something more descriptive?
	 */
	look?: null | {
		firstColumn?: null | boolean;
		lastColumn?: null | boolean;
		firstRow?: null | boolean;
		lastRow?: null | boolean;
		noHBand?: null | boolean;
		noVBand?: null | boolean;
	};
	/**
	 * The cell padding, space between its border and its contents, for each side of a cell.
	 */
	cellPadding?: null | {
		top?: null | Length;
		bottom?: null | Length;
		start?: null | Length;
		end?: null | Length;
	};
	borders?: null | {
		top?: null | Border<LineBorderType | ArtBorderType>;
		left?: null | Border<LineBorderType | ArtBorderType>;
		bottom?: null | Border<LineBorderType | ArtBorderType>;
		right?: null | Border<LineBorderType | ArtBorderType>;
		insideH?: null | Border<LineBorderType | ArtBorderType>;
		insideV?: null | Border<LineBorderType | ArtBorderType>;
	};
};

export function tablePropertiesFromNode(node: Node | null): TableProperties {
	const properties = node
		? evaluateXPathToMap<TableProperties>(
				`map {
					"style": ./${QNS.w}tblStyle/@${QNS.w}val/string(),
					"look": ./${QNS.w}tblLook/map {
						"firstColumn": docxml:st-on-off(@${QNS.w}firstColumn),
						"lastColumn": docxml:st-on-off(@${QNS.w}lastColumn),
						"firstRow": docxml:st-on-off(@${QNS.w}firstRow),
						"lastRow": docxml:st-on-off(@${QNS.w}lastRow),
						"noHBand": docxml:st-on-off(@${QNS.w}noHBand),
						"noVBand": docxml:st-on-off(@${QNS.w}noVBand)
					},
					"indentation": docxml:length(${QNS.w}tblInd[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
					"cellSpacing": docxml:length(${QNS.w}tblCellSpacing[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
					"cellPadding": ./${QNS.w}tblCellMar/map {
						"top": docxml:length(${QNS.w}top[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
						"start": docxml:length((${QNS.w}start|${QNS.w}left)[not(@${QNS.w}type = 'nil')][1]/@${QNS.w}w, 'twip'),
						"bottom": docxml:length(${QNS.w}bottom[not(@${QNS.w}type = 'nil')]/@${QNS.w}w, 'twip'),
						"end": docxml:length((${QNS.w}end|${QNS.w}right)[not(@${QNS.w}type = 'nil')][1]/@${QNS.w}w, 'twip')
					},
					"columnBandingSize": ./${QNS.w}tblStyleColBandSize/@${QNS.w}val/number(),
					"rowBandingSize": ./${QNS.w}tblStyleRowBandSize/@${QNS.w}val/number(),
					"borders": ./${QNS.w}tblBorders/map {
						"top": docxml:ct-border(${QNS.w}top),
						"left": docxml:ct-border(${QNS.w}left),
						"bottom": docxml:ct-border(${QNS.w}bottom),
						"right": docxml:ct-border(${QNS.w}right),
						"insideH": docxml:ct-border(${QNS.w}insideH),
						"insideV": docxml:ct-border(${QNS.w}insideV)
					},
					"width": ./${QNS.w}tblW/map {
						"length": ./@${QNS.w}val/string(),
						"unit": ./@${QNS.w}type/string()
					}
				}`,
				node,
		  )
		: {};

	return properties;
}

export function tablePropertiesToNode(tblpr: TableProperties = {}): Node {
	return create(
		`element ${QNS.w}tblPr {
			if ($style) then element ${QNS.w}tblStyle {
				attribute ${QNS.w}val { $style }
			} else (),
			if (exists($width)) then element ${QNS.w}tblW {
				attribute ${QNS.w}val { $width('length') },
				attribute ${QNS.w}type { $width('unit') }
			} else (),
			if (exists($look)) then element ${QNS.w}tblLook {
				if ($look('firstColumn')) then attribute ${QNS.w}firstColumn { "1" } else (),
				if ($look('firstRow')) then attribute ${QNS.w}firstRow { "1" } else (),
				if ($look('lastColumn')) then attribute ${QNS.w}lastColumn { "1" } else (),
				if ($look('lastRow')) then attribute ${QNS.w}lastRow { "1" } else (),
				if ($look('noHBand')) then attribute ${QNS.w}noHBand { "1" } else (),
				if ($look('noVBand')) then attribute ${QNS.w}noVBand { "1"}  else ()
			} else (),
			if (exists($cellPadding)) then element ${QNS.w}tblCellMar {
				if (exists($cellPadding('top'))) then element ${QNS.w}top {
					attribute ${QNS.w}w { $cellPadding('top')('twip') },
					attribute ${QNS.w}type { "dxa" }
				} else (),
				if (exists($cellPadding('bottom'))) then element ${QNS.w}bottom {
					attribute ${QNS.w}w { $cellPadding('bottom')('twip') },
					attribute ${QNS.w}type { "dxa" }
				} else (),
				if (exists($cellPadding('start'))) then element ${QNS.w}start {
					attribute ${QNS.w}w { $cellPadding('start')('twip') },
					attribute ${QNS.w}type { "dxa" }
				} else (),
				if (exists($cellPadding('end'))) then element ${QNS.w}end {
					attribute ${QNS.w}w { $cellPadding('end')('twip') },
					attribute ${QNS.w}type { "dxa" }
				} else ()
			} else (),
			if (exists($borders)) then element ${QNS.w}tblBorders {
				(: In sequence order: :)
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "left"), $borders('left')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "right"), $borders('right')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
				docxml:ct-border(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
			} else (),
			if (exists($indentation)) then element ${QNS.w}tblInd {
				attribute ${QNS.w}w { $indentation('twip') },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if (exists($cellSpacing)) then element ${QNS.w}tblCellSpacing {
				attribute ${QNS.w}w { $cellSpacing('twip') },
				attribute ${QNS.w}type { "dxa" }
			} else (),
			if (exists($columnBandingSize)) then element ${QNS.w}tblStyleColBandSize {
				attribute ${QNS.w}val { $columnBandingSize }
			} else (),
			if (exists($rowBandingSize)) then element ${QNS.w}tblStyleRowBandSize {
				attribute ${QNS.w}val { $rowBandingSize }
			} else ()
		}`,
		{
			style: tblpr.style || null,
			look: tblpr.look || null,
			width:
				typeof tblpr.width === 'string' && tblpr.width.endsWith('%')
					? { length: tblpr.width, unit: 'pct' }
					: typeof tblpr.width === 'number'
					? {
							length: tblpr.width,
							unit: 'dxa',
					  }
					: tblpr.width || null,
			cellPadding: tblpr.cellPadding || null,
			borders: tblpr.borders
				? {
						top: null,
						left: null,
						bottom: null,
						right: null,
						insideH: null,
						insideV: null,
						...tblpr.borders,
				  }
				: null,
			indentation: tblpr.indentation || null,
			cellSpacing: tblpr.cellSpacing || null,
			columnBandingSize: tblpr.columnBandingSize || null,
			rowBandingSize: tblpr.rowBandingSize || null,
		},
	);
}
