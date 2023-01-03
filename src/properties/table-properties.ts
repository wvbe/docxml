import { create } from '../utilities/dom.ts';
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
	borders?: null | {
		top?: null | Border<LineBorderType | ArtBorderType>;
		left?: null | Border<LineBorderType | ArtBorderType>;
		bottom?: null | Border<LineBorderType | ArtBorderType>;
		right?: null | Border<LineBorderType | ArtBorderType>;
		insideH?: null | Border<LineBorderType | ArtBorderType>;
		insideV?: null | Border<LineBorderType | ArtBorderType>;
	};
};

export function tablePropertiesFromNode(node?: Node | null): TableProperties {
	return node
		? evaluateXPathToMap<TableProperties>(
				`
						map {
							"style": ./${QNS.w}tblStyle/@${QNS.w}val/string(),
							"look": ./${QNS.w}tblLook/map {
								"firstColumn": ./@${QNS.w}firstColumn/ooxml:is-on-off-enabled(.),
								"lastColumn": ./@${QNS.w}lastColumn/ooxml:is-on-off-enabled(.),
								"firstRow": ./@${QNS.w}firstRow/ooxml:is-on-off-enabled(.),
								"lastRow": ./@${QNS.w}lastRow/ooxml:is-on-off-enabled(.),
								"noHBand": ./@${QNS.w}noHBand/ooxml:is-on-off-enabled(.),
								"noVBand": ./@${QNS.w}noVBand/ooxml:is-on-off-enabled(.)
							},
							"borders": ./${QNS.w}tblBorders/map {
								"top": ./${QNS.w}top/ooxml:border(.),
								"left": ./${QNS.w}left/ooxml:border(.),
								"bottom": ./${QNS.w}bottom/ooxml:border(.),
								"right": ./${QNS.w}right/ooxml:border(.),
								"insideH": ./${QNS.w}insideH/ooxml:border(.),
								"insideV": ./${QNS.w}insideV/ooxml:border(.)
							},
							"width": ./${QNS.w}tblW/map {
								"length": ./@${QNS.w}val/string(),
								"unit": ./@${QNS.w}type/string()
							}
						}
					`,
				node,
		  )
		: {};
}

export function tablePropertiesToNode(tblpr: TableProperties = {}): Node {
	return create(
		`
				element ${QNS.w}tblPr {
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
					if (exists($borders)) then element ${QNS.w}tblBorders {
						(: In sequence order: :)
						ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
						ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "left"), $borders('left')),
						ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
						ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "right"), $borders('right')),
						ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
						ooxml:create-border-element(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
					} else ()

				}
			`,
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
		},
	);
}
