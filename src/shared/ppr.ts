import { TwentiethPoint } from '../types.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToFirstNode, evaluateXPathToMap } from '../util/xquery.ts';
import { Rpr, RprI } from './rpr.ts';

type PprII = {
	alignment?: 'left' | 'right' | 'center' | 'both' | null;
	style?: string | null;
	spacing?: null | {
		before?: TwentiethPoint | null;
		after?: TwentiethPoint | null;
		line?: TwentiethPoint | null;
		lineRule?: 'atLeast' | 'exactly' | 'auto' | null;
		afterAutoSpacing?: boolean | null;
		beforeAutoSpacing?: boolean | null;
	};
	indentation?: null | {
		left?: TwentiethPoint | null;
		leftChars?: number | null;
		right?: TwentiethPoint | null;
		rightChars?: number | null;
		hanging?: TwentiethPoint | null;
		hangingChars?: number | null;
		firstLine?: TwentiethPoint | null;
		firstLineChars?: number | null;
	};
	change?:
		| null
		| ({
				id: number;
				author: string;
				date: Date;
		  } & Omit<PprI, 'change'>);
};

/**
 * All the formatting properties that can be given to a paragraph, _including_ the text run formatting
 * and change tracking information.
 *
 * @note that there should be no naming collisions between PprI and RprI!
 *
 * Serializes to the <w:pPr> element.
 *   http://officeopenxml.com/WPparagraphProperties.php
 *   http://www.datypic.com/sc/ooxml/e-w_pPr-6.html
 */
export type PprI = RprI & PprII;

export class Ppr {
	private constructor() {
		throw new Error('This class is not meant to be instantiated');
	}

	public static fromNode(node?: Node | null): PprI {
		const ppr = node
			? evaluateXPathToMap(
					`
				map {
					"alignment": ${QNS.w}jc/@${QNS.w}val/string(),
					"style": ${QNS.w}pStyle/@${QNS.w}val/string(),

					"spacing": ${QNS.w}spacing/map {
						"before": @${QNS.w}before/number(),
						"after": @${QNS.w}after/number(),
						"line": @${QNS.w}line/number(),
						"lineRule": @${QNS.w}lineRule/string(),
						"afterAutoSpacing": @${QNS.w}afterAutoSpacing/ooxml:is-on-off-enabled(.),
						"beforeAutoSpacing": @${QNS.w}beforeAutoSpacing/ooxml:is-on-off-enabled(.)
					},
					"indentation": ${QNS.w}ind/map {
						"left": @${QNS.w}left/number(),
						"leftChars": @${QNS.w}leftChars/number(),
						"right": @${QNS.w}right/number(),
						"rightChars": @${QNS.w}rightChars/number(),
						"hanging": @${QNS.w}hanging/number(),
						"hangingChars": @${QNS.w}hangingChars/number(),
						"firstLine": @${QNS.w}firstLine/number(),
						"firstLineChars": @${QNS.w}firstLineChars/number()
					},
					"change": ${QNS.w}pPrChange/map {
						"id": @${QNS.w}id/string(),
						"author": @${QNS.w}author/string(),
						"date": @${QNS.w}date/string(),
						"_node": ./${QNS.w}pPr
					}
				}
			`,
					node,
			  ) || {}
			: {};

		return {
			...ppr,
			...Rpr.fromNode(node && evaluateXPathToFirstNode(`./${QNS.w}rPr`, node)),
			change: ppr.change
				? {
						...ppr.change,
						date: new Date(ppr.change.date),
						...this.fromNode(ppr.change._node),
						_node: undefined,
				  }
				: null,
		};
	}

	public static toNode(ppr: PprI = {}): Node {
		return create(
			`
				element ${QNS.w}pPr {
					if (exists($style)) then element ${QNS.w}pStyle {
						attribute ${QNS.w}val { $style }
					} else (),
					if (exists($alignment)) then element ${QNS.w}jc {
						attribute ${QNS.w}val { $alignment }
					} else (),

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
						} else ()
					} else (),

					$rpr,

					if (exists($change)) then element ${QNS.w}pPrChange {
						attribute ${QNS.w}id { $change('id') },
						attribute ${QNS.w}author { $change('author') },
						attribute ${QNS.w}date { $change('date') },
						$change('node')
					} else ()
				}
			`,
			{
				style: ppr.style || null,
				alignment: ppr.alignment || null,
				indentation: ppr.indentation || null,
				spacing: ppr.spacing
					? {
							...ppr.spacing,
							lineRule: ppr.spacing.lineRule || null,
					  }
					: null,
				change: ppr.change
					? {
							id: ppr.change.id,
							author: ppr.change.author,
							date: ppr.change.date.toISOString(),
							node: this.toNode(ppr.change),
					  }
					: null,
				rpr: Rpr.toNode(ppr),
			},
		);
	}
}
