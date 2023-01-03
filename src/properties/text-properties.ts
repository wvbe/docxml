import { create } from '../utilities/dom.ts';
import { Length } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * All the formatting options that can be given on a text run (inline text).
 *
 * Serializes to the <w:rPr> element.
 *   https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_rPr_topic_ID0EIEKM.html
 */
export type TextProperties = {
	style?: string | null;
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
		| 'none';
	isBold?: boolean | null;
	isItalic?: boolean | null;
	isCaps?: boolean | null;
	isSmallCaps?: boolean | null;
	language?: string | null;
	fontSize?: Length | null;
	isStrike?: boolean | null;
	font?:
		| string
		| {
				cs?: string | null;
				ascii?: string | null;
				hAnsi?: string | null;
		  }
		| null;
};

export function textPropertiesFromNode(node?: Node | null): TextProperties {
	if (!node) {
		return {};
	}
	return evaluateXPathToMap<TextProperties>(
		`
			map {
				"style": ./${QNS.w}rStyle/@${QNS.w}val/string(),
				"color": ./${QNS.w}color/@${QNS.w}val/string(),
				"isUnderlined": ./${QNS.w}u/@${QNS.w}val/string(),
				"isBold": boolean(./${QNS.w}b),
				"isItalic": boolean(./${QNS.w}i),
				"isSmallCaps": boolean(./${QNS.w}smallCaps),
				"isCaps": boolean(./${QNS.w}caps),
				"verticalAlign": ./${QNS.w}vertAlign/@${QNS.w}val/string(),
				"language": ./${QNS.w}lang/@${QNS.w}val/string(),
				"fontSize": ./${QNS.w}sz/@${QNS.w}val/ooxml:universal-size(xs:float(.), "hpt"),
				"isStrike": boolean(./${QNS.w}strike),
				"font": ./${QNS.w}rFonts/map {
					"cs": @${QNS.w}cs/string(),
					"ascii": @${QNS.w}ascii/string(),
					"hAnsi": @${QNS.w}hAnsi/string()
				}
			}
		`,
		node,
	);
}

export function textPropertiesToNode(data: TextProperties = {}): Node | null {
	if (
		!data.style &&
		!data.color &&
		!data.isUnderlined &&
		!data.language &&
		!data.isBold &&
		!data.verticalAlign &&
		!data.isItalic &&
		!data.isSmallCaps &&
		!data.isCaps &&
		!data.fontSize &&
		!data.isStrike &&
		!data.font
	) {
		return null;
	}
	return create(
		`element ${QNS.w}rPr {
			if ($style) then element ${QNS.w}rStyle {
				attribute ${QNS.w}val { $style }
			} else (),
			if ($color) then element ${QNS.w}color {
				attribute ${QNS.w}val { $color }
			} else (),
			if ($isUnderlined) then element ${QNS.w}u {
				attribute ${QNS.w}val { $isUnderlined }
			} else (),
			if ($isBold) then element ${QNS.w}b {} else (),
			if ($isItalic) then element ${QNS.w}i {} else (),
			if ($isSmallCaps) then element ${QNS.w}smallCaps {} else (),
			if ($isCaps) then element ${QNS.w}caps {} else (),
			if ($verticalAlign) then element ${QNS.w}vertAlign {
				attribute ${QNS.w}val { $verticalAlign }
			} else (),
			if ($language) then element ${QNS.w}lang {
				attribute ${QNS.w}val { $language }
			} else (),
			if ($fontSize) then element ${QNS.w}sz {
				attribute ${QNS.w}val { $fontSize }
			} else (),
			if ($isStrike) then element ${QNS.w}strike {} else (),

			if (exists($font)) then element ${QNS.w}rFonts {
				if (exists($font('cs'))) then attribute ${QNS.w}cs {
					$font('cs')
				} else (),
				if (exists($font('ascii'))) then attribute ${QNS.w}ascii {
					$font('ascii')
				} else (),
				if (exists($font('hAnsi'))) then attribute ${QNS.w}hAnsi {
					$font('hAnsi')
				} else ()
			} else ()
		}`,
		{
			style: data.style || null,
			color: data.color || null,
			isUnderlined: data.isUnderlined === true ? 'single' : data.isUnderlined || null,
			language: data.language || null,
			isBold: data.isBold || false,
			verticalAlign: data.verticalAlign || null,
			isItalic: data.isItalic || false,
			isSmallCaps: data.isSmallCaps || false,
			isCaps: data.isCaps || false,
			fontSize: data.fontSize ? data.fontSize.hpt : null,
			isStrike: data.isStrike || false,
			font:
				typeof data.font === 'string'
					? {
							cs: data.font,
							ascii: data.font,
							hAnsi: data.font,
					  }
					: data.font
					? {
							cs: data.font.cs || null,
							ascii: data.font.ascii || null,
							hAnsi: data.font.hAnsi || null,
					  }
					: null,
		},
	);
}
