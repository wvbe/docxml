import { HalfPoint } from '../types.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';

/**
 * All the formatting options that can be given on a text run (inline text).
 *
 * Serializes to the <w:rPr> element.
 *   https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_rPr_topic_ID0EIEKM.html
 */
export type RprI = {
	color?: string | null;
	verticalAlign?: 'baseline' | 'subscript' | 'superscript' | null;
	isUnderlined?:
		| null
		| boolean
		| 'single'
		| 'words'
		| 'double'
		| 'thick'
		| 'dotted'
		| 'dottedHeavy'
		| 'dash'
		| 'dashedHeavy'
		| 'dashLong'
		| 'dashLongHeavy'
		| 'dotDash'
		| 'dashDotHeavy'
		| 'dotDotDash'
		| 'dashDotDotHeavy'
		| 'wave'
		| 'wavyHeavy'
		| 'wavyDouble'
		| 'none'
		| null;
	isBold?: boolean | null;
	isItalic?: boolean | null;
	isSmallCaps?: boolean | null;
	language?: string | null;
	/**
	 * In twentieth points
	 */
	fontSize?: HalfPoint | null;
};

export class Rpr {
	private constructor() {
		throw new Error('This class is not meant to be instantiated');
	}

	public static fromNode(node?: Node | null): RprI {
		return node
			? evaluateXPathToMap(
					`
						map {
							"color": ./${QNS.w}color/@${QNS.w}val/string(),
							"isUnderlined": ./${QNS.w}u/@${QNS.w}val/string(),
							"isBold": boolean(./${QNS.w}b),
							"isItalic": boolean(./${QNS.w}i),
							"isSmallCaps": boolean(./${QNS.w}smallCaps),
							"verticalAlign": ./${QNS.w}vertAlign/@${QNS.w}val/string(),
							"language": ./${QNS.w}lang/@${QNS.w}val/string(),
							"fontSize": ./${QNS.w}sz/@${QNS.w}val/number()
						}
					`,
					node,
			  )
			: {};
	}

	public static toNode(rpr: RprI = {}): Node {
		return create(
			`
				element ${QNS.w}rPr {
					if ($color) then element ${QNS.w}color {
						attribute ${QNS.w}val { $color }
					} else (),
					if ($isUnderlined) then element ${QNS.w}u {
						attribute ${QNS.w}val { $isUnderlined }
					} else (),
					if ($isBold) then element ${QNS.w}b {} else (),
					if ($isItalic) then element ${QNS.w}i {} else (),
					if ($isSmallCaps) then element ${QNS.w}smallCaps {} else (),
					if ($verticalAlign) then element ${QNS.w}vertAlign {
						attribute ${QNS.w}val { $verticalAlign }
					} else (),
					if ($language) then element ${QNS.w}lang {
						attribute ${QNS.w}val { $language }
					} else (),
					if ($fontSize) then element ${QNS.w}sz {
						attribute ${QNS.w}val { $fontSize }
					} else ()
				}
			`,
			{
				color: rpr.color || null,
				isUnderlined: rpr.isUnderlined === true ? 'single' : rpr.isUnderlined || null,
				language: rpr.language || null,
				isBold: rpr.isBold || false,
				verticalAlign: rpr.verticalAlign || null,
				isItalic: rpr.isItalic || false,
				isSmallCaps: rpr.isSmallCaps || false,
				fontSize: rpr.fontSize || null,
			},
		);
	}
}
