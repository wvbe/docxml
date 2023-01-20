import { create } from '../utilities/dom.ts';
import { type Length, twip } from '../utilities/length.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToFirstNode, evaluateXPathToMap } from '../utilities/xquery.ts';
import { type SectionProperties, sectionPropertiesToNode } from './section-properties.ts';
import { type Border, type LineBorderType, type Shading } from './shared-properties.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from './text-properties.ts';

/**
 * All the formatting properties that can be given to a paragraph.
 *
 * Serializes to the <w:pPr> element.
 *   http://officeopenxml.com/WPparagraphProperties.php
 *   http://www.datypic.com/sc/ooxml/e-w_pPr-6.html
 */
export type ParagraphProperties = {
	alignment?: 'left' | 'right' | 'center' | 'both' | null;
	outlineLvl?: number | null;
	style?: string | null;
	spacing?: {
		before?: Length | null;
		after?: Length | null;
		line?: Length | null;
		lineRule?: 'atLeast' | 'exactly' | 'auto' | null;
		afterAutoSpacing?: boolean | null;
		beforeAutoSpacing?: boolean | null;
	} | null;
	indentation?: {
		left?: Length | null;
		leftChars?: number | null;
		right?: Length | null;
		rightChars?: number | null;
		hanging?: Length | null;
		hangingChars?: number | null;
		firstLine?: Length | null;
		firstLineChars?: number | null;
		// MSWORD 2010:
		start?: Length | null;
		startChars?: number | null;
		end?: Length | null;
		endChars?: number | null;
	} | null;
	borders?: null | {
		top?: null | Border<LineBorderType>;
		left?: null | Border<LineBorderType>;
		bottom?: null | Border<LineBorderType>;
		right?: null | Border<LineBorderType>;
		between?: null | Border<LineBorderType>;
	};
	shading?: null | Shading;
	listItem?: null | {
		numbering?: null | number;
		depth?: null | number;
	};
	change?:
		| null
		| ({
				id: number;
				author: string;
				date: Date;
		  } & Omit<ParagraphProperties, 'change'>);

	/**
	 * Formatting of the pilcrow signn
	 */
	pilcrow?: TextProperties | null;
};

export function paragraphPropertiesFromNode(node?: Node | null): ParagraphProperties {
	const data = node
		? // deno-lint-ignore no-explicit-any
		  evaluateXPathToMap<any>(
				`map {
					"alignment": ${QNS.w}jc/@${QNS.w}val/string(),
					"outlineLvl": ${QNS.w}outlineLvl/@${QNS.w}val/number(),
					"style": ${QNS.w}pStyle/@${QNS.w}val/string(),
					"spacing": ${QNS.w}spacing/map {
						"before": @${QNS.w}before/number(),
						"after": @${QNS.w}after/number(),
						"line": @${QNS.w}line/number(),
						"lineRule": @${QNS.w}lineRule/string(),
						"afterAutoSpacing": @${QNS.w}afterAutoSpacing/docxml:is-on-off-enabled(.),
						"beforeAutoSpacing": @${QNS.w}beforeAutoSpacing/docxml:is-on-off-enabled(.)
					},
					"indentation": ${QNS.w}ind/map {
						"left": @${QNS.w}left/number(),
						"leftChars": @${QNS.w}leftChars/number(),
						"right": @${QNS.w}right/number(),
						"rightChars": @${QNS.w}rightChars/number(),
						"hanging": @${QNS.w}hanging/number(),
						"hangingChars": @${QNS.w}hangingChars/number(),
						"firstLine": @${QNS.w}firstLine/number(),
						"firstLineChars": @${QNS.w}firstLineChars/number(),
						"start": @${QNS.w}start/number(),
						"startChars": @${QNS.w}startChars/number(),
						"end": @${QNS.w}end/number(),
						"endChars": @${QNS.w}endChars/number()
					},
					"shading": ./${QNS.w}shd/docxml:shading(.),
					"borders": ./${QNS.w}pBdr/map {
						"top": ./${QNS.w}top/docxml:border(.),
						"left": ./${QNS.w}left/docxml:border(.),
						"bottom": ./${QNS.w}bottom/docxml:border(.),
						"right": ./${QNS.w}right/docxml:border(.),
						"between": ./${QNS.w}between/docxml:border(.)
					},
					"listItem": ./${QNS.w}numPr/map {
						"numbering": ./${QNS.w}numId/@${QNS.w}val/number(),
						"depth": ./${QNS.w}ilvl/@${QNS.w}val/number()
					},
					"change": ${QNS.w}pPrChange/map {
						"id": @${QNS.w}id/string(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(),
						"_node": ./${QNS.w}pPr
					}
				}`,
				node,
		  ) || {}
		: {};

	// Sad but necessary.
	if (data.spacing?.before) {
		data.spacing.before = twip(data.spacing.before);
	}
	if (data.spacing?.after) {
		data.spacing.after = twip(data.spacing.after);
	}
	if (data.spacing?.line) {
		data.spacing.line = twip(data.spacing.line);
	}
	if (data.indentation?.left) {
		data.indentation.left = twip(data.indentation.left);
	}
	if (data.indentation?.right) {
		data.indentation.right = twip(data.indentation.right);
	}
	if (data.indentation?.hanging) {
		data.indentation.hanging = twip(data.indentation.hanging);
	}
	if (data.indentation?.firstLine) {
		data.indentation.firstLine = twip(data.indentation.firstLine);
	}
	if (data.indentation?.start) {
		data.indentation.start = twip(data.indentation.start);
	}
	if (data.indentation?.end) {
		data.indentation.end = twip(data.indentation.end);
	}

	const rpr = node && evaluateXPathToFirstNode(`./${QNS.w}rPr`, node);

	if (rpr) {
		data.pilcrow = textPropertiesFromNode(rpr);
	}
	if (data.change) {
		data.change = {
			...data.change,
			date: new Date(data.change.date),
			...paragraphPropertiesFromNode(data.change._node),
			_node: undefined,
		};
	} else {
		delete data.change;
	}
	return data;
}

export function paragraphPropertiesToNode(
	data: ParagraphProperties = {},
	sectionProperties: SectionProperties | null = null,
): Node | null {
	if (!Object.keys(data).length && !sectionProperties) {
		return null;
	}
	return create(
		`
			element ${QNS.w}pPr {
				if (exists($style)) then element ${QNS.w}pStyle {
					attribute ${QNS.w}val { $style }
				} else (),
				if (exists($listItem)) then element ${QNS.w}numPr {
					if (exists($listItem('numbering'))) then element ${QNS.w}numId {
						attribute ${QNS.w}val { $listItem('numbering') }
					} else (),
					if (exists($listItem('depth'))) then element ${QNS.w}ilvl {
						attribute ${QNS.w}val { $listItem('depth') }
					} else ()
				} else (),
				if (exists($alignment)) then element ${QNS.w}jc {
					attribute ${QNS.w}val { $alignment }
				} else (),
				if (exists($outlineLvl)) then element ${QNS.w}outlineLvl {
					attribute ${QNS.w}val { $outlineLvl }
				} else (),
				if (exists($shading)) then docxml:create-shading-element($shading) else (),
				if (exists($spacing)) then element ${QNS.w}spacing {
					if (exists($spacing('before'))) then attribute ${QNS.w}before {
						$spacing('before')
					} else (),
					if (exists($spacing('after'))) then attribute ${QNS.w}after {
						$spacing('after')
					} else (),
					if (exists($spacing('line'))) then attribute ${QNS.w}line {
						$spacing('line')
					} else (),
					if (exists($spacing('lineRule'))) then attribute ${QNS.w}lineRule {
						$spacing('lineRule')
					} else (),
					if (exists($spacing('afterAutoSpacing'))) then attribute ${QNS.w}afterAutoSpacing {
						$spacing('afterAutoSpacing')
					} else (),
					if (exists($spacing('beforeAutoSpacing'))) then attribute ${QNS.w}beforeAutoSpacing {
						$spacing('beforeAutoSpacing')
					} else ()
				} else (),

				if (exists($indentation)) then element ${QNS.w}ind {
					if (exists($indentation('left'))) then attribute ${QNS.w}left {
						$indentation('left')
					} else (),
					if (exists($indentation('leftChars'))) then attribute ${QNS.w}leftChars {
						$indentation('leftChars')
					} else (),
					if (exists($indentation('right'))) then attribute ${QNS.w}right {
						$indentation('right')
					} else (),
					if (exists($indentation('rightChars'))) then attribute ${QNS.w}rightChars {
						$indentation('rightChars')
					} else (),
					if (exists($indentation('hanging'))) then attribute ${QNS.w}hanging {
						$indentation('hanging')
					} else (),
					if (exists($indentation('hangingChars'))) then attribute ${QNS.w}hangingChars {
						$indentation('hangingChars')
					} else (),
					if (exists($indentation('firstLine'))) then attribute ${QNS.w}firstLine {
						$indentation('firstLine')
					} else (),
					if (exists($indentation('firstLineChars'))) then attribute ${QNS.w}firstLineChars {
						$indentation('firstLineChars')
					} else (),
					if (exists($indentation('start'))) then attribute ${QNS.w}start {
						$indentation('start')
					} else (),
					if (exists($indentation('startChars'))) then attribute ${QNS.w}startChars {
						$indentation('startChars')
					} else (),
					if (exists($indentation('end'))) then attribute ${QNS.w}end {
						$indentation('end')
					} else (),
					if (exists($indentation('endChars'))) then attribute ${QNS.w}endChars {
						$indentation('endChars')
					} else ()
				} else (),

				if (exists($borders)) then element ${QNS.w}pBdr {
					(: In sequence order: :)
					docxml:create-border-element(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
					docxml:create-border-element(fn:QName("${NamespaceUri.w}", "left"), $borders('left')),
					docxml:create-border-element(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
					docxml:create-border-element(fn:QName("${NamespaceUri.w}", "right"), $borders('right')),
					docxml:create-border-element(fn:QName("${NamespaceUri.w}", "between"), $borders('between'))
				} else (),

				$rpr,
				$sectpr,

				if (exists($change)) then element ${QNS.w}pPrChange {
					attribute ${QNS.w}id { $change('id') },
					attribute ${QNS.w}author { $change('author') },
					attribute ${QNS.w}date { $change('date') },
					$change('node')
				} else ()
			}
		`,
		{
			style: data.style || null,
			alignment: data.alignment || null,
			outlineLvl:
				data.outlineLvl === null || data.outlineLvl === undefined ? null : data.outlineLvl,
			indentation: data.indentation
				? {
						...data.indentation,
						left: data.indentation.left?.twip || null,
						right: data.indentation.right?.twip || null,
						hanging: data.indentation.hanging?.twip || null,
						firstLine: data.indentation.firstLine?.twip || null,
						start: data.indentation.start?.twip || null,
						end: data.indentation.end?.twip || null,
				  }
				: null,
			shading: data.shading || null,
			spacing: data.spacing
				? {
						...data.spacing,
						before: data.spacing.before?.twip || null,
						after: data.spacing.after?.twip || null,
						line: data.spacing.line?.twip || null,
						lineRule: data.spacing.lineRule || null,
				  }
				: null,
			borders: data.borders
				? {
						top: null,
						left: null,
						bottom: null,
						right: null,
						between: null,
						...data.borders,
				  }
				: null,
			listItem: data.listItem || null,
			change: data.change
				? {
						id: data.change.id,
						author: data.change.author,
						date: data.change.date.toISOString(),
						node: paragraphPropertiesToNode(data.change),
				  }
				: null,
			rpr: textPropertiesToNode(data.pilcrow || undefined),
			sectpr: sectionProperties && sectionPropertiesToNode(sectionProperties),
		},
	);
}
