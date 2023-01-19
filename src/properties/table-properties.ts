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
						"firstColumn": ./@${QNS.w}firstColumn/docxml:is-on-off-enabled(.),
						"lastColumn": ./@${QNS.w}lastColumn/docxml:is-on-off-enabled(.),
						"firstRow": ./@${QNS.w}firstRow/docxml:is-on-off-enabled(.),
						"lastRow": ./@${QNS.w}lastRow/docxml:is-on-off-enabled(.),
						"noHBand": ./@${QNS.w}noHBand/docxml:is-on-off-enabled(.),
						"noVBand": ./@${QNS.w}noVBand/docxml:is-on-off-enabled(.)
					},
					"indentation": ./${QNS.w}tblInd[not(@${QNS.w}type = 'nil')]/@${QNS.w}w/docxml:length(., 'twip'),
					"cellSpacing": ./${QNS.w}tblCellSpacing[not(@${QNS.w}type = 'nil')]/@${QNS.w}w/docxml:length(., 'twip'),
					"cellPadding": ./${QNS.w}tblCellMar/map {
						"top": ./${QNS.w}top[not(@${QNS.w}type = 'nil')]/@${QNS.w}w/docxml:length(., 'twip'),
						"start": ./(${QNS.w}start|${QNS.w}left)[not(@${QNS.w}type = 'nil')][1]/@${QNS.w}w/docxml:length(., 'twip'),
						"bottom": ./${QNS.w}bottom[not(@${QNS.w}type = 'nil')]/@${QNS.w}w/docxml:length(., 'twip'),
						"end": ./(${QNS.w}end|${QNS.w}right)[not(@${QNS.w}type = 'nil')][1]/@${QNS.w}w/docxml:length(., 'twip')
					},
					"columnBandingSize": ./${QNS.w}tblStyleColBandSize/@${QNS.w}val/number(),
					"rowBandingSize": ./${QNS.w}tblStyleRowBandSize/@${QNS.w}val/number(),
					"borders": ./${QNS.w}tblBorders/map {
						"top": ./${QNS.w}top/docxml:border(.),
						"left": ./${QNS.w}left/docxml:border(.),
						"bottom": ./${QNS.w}bottom/docxml:border(.),
						"right": ./${QNS.w}right/docxml:border(.),
						"insideH": ./${QNS.w}insideH/docxml:border(.),
						"insideV": ./${QNS.w}insideV/docxml:border(.)
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
				docxml:create-border-element(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
				docxml:create-border-element(fn:QName("${NamespaceUri.w}", "left"), $borders('left')),
				docxml:create-border-element(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
				docxml:create-border-element(fn:QName("${NamespaceUri.w}", "right"), $borders('right')),
				docxml:create-border-element(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
				docxml:create-border-element(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
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
