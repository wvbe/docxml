import { create } from '../utilities/dom.ts';
import { Length } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

type SimpleOrComplex<Generic> = { simple?: Generic | null; complex?: Generic | null };
function explodeSimpleOrComplex<Generic>(
	value: Generic | SimpleOrComplex<Generic> | null,
): Required<SimpleOrComplex<Generic>> | null {
	if (value === null) {
		return { simple: null, complex: null };
	}
	if (
		(value as SimpleOrComplex<Generic>).simple === undefined &&
		(value as SimpleOrComplex<Generic>).complex === undefined
	) {
		return {
			simple: (value as Generic) || null,
			complex: (value as Generic) || null,
		};
	}
	return {
		simple: (value as SimpleOrComplex<Generic>).simple || null,
		complex: (value as SimpleOrComplex<Generic>).complex || null,
	};
}

/**
 * All the formatting options that can be given on a text run (inline text).
 *
 * Serializes to the <w:rPr> element.
 *   https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_rPr_topic_ID0EIEKM.html
 */
export type TextProperties = {
	/**
	 * Show this text according to the style that is referenced through this style identifier.
	 */
	style?: string | null;
	/**
	 * The color of this text. Type as a hexidecimal code (`"ff0000"`) or a basic color name (`"red"`).
	 */
	color?: string | null;
	/**
	 * The baseline position of this text.
	 */
	verticalAlign?: 'baseline' | 'subscript' | 'superscript' | null;
	/**
	 * Display this text with an underline, and if so, what kind of line.
	 */
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
	/**
	 * Display extra thick characters, or not.
	 */
	isBold?: boolean | SimpleOrComplex<boolean> | null;
	/**
	 * Display text with a slant, or not.
	 */
	isItalic?: boolean | SimpleOrComplex<boolean> | null;
	/**
	 * Display text as capital letters, or not.
	 */
	isCaps?: boolean | null;
	/**
	 * Display text as small capital letters, or not.
	 */
	isSmallCaps?: boolean | null;
	/**
	 * The language of this bit of text, for spell checking.
	 */
	language?: string | null;
	/**
	 * The size of your font.
	 */
	fontSize?: Length | SimpleOrComplex<Length> | null;
	/**
	 * If the font size is equal or larger to `.minimumKerningFontSize`, font kerning should be applied.
	 */
	minimumKerningFontSize?: Length | null;
	/**
	 * Display text with a strike-through, or not.
	 */
	isStrike?: boolean | null;
	/**
	 * The space between letters.
	 */
	spacing?: Length | null;
	/**
	 * The name of the font family used for this text. Set as either a string, or as an object if you
	 * want more control over different font variations.
	 */
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
				"isBold": map {
					"simple": docxml:ct-on-off(./${QNS.w}b),
					"complex": docxml:ct-on-off(./${QNS.w}bCs)
				},
				"isItalic": map {
					"simple": docxml:ct-on-off(./${QNS.w}i),
					"complex": docxml:ct-on-off(./${QNS.w}iCs)
				},
				"isSmallCaps": docxml:ct-on-off(./${QNS.w}smallCaps),
				"isCaps": docxml:ct-on-off(./${QNS.w}caps),
				"verticalAlign": ./${QNS.w}vertAlign/@${QNS.w}val/string(),
				"language": ./${QNS.w}lang/@${QNS.w}val/string(),
				"fontSize": map {
					"simple": docxml:length(${QNS.w}sz/@${QNS.w}val, "hpt"),
					"complex": docxml:length(${QNS.w}szCs/@${QNS.w}val, "hpt")
				},
				"minimumKerningFontSize": docxml:length(${QNS.w}kern/@${QNS.w}val, "hpt"),
				"isStrike": docxml:ct-on-off(./${QNS.w}strike),
				"spacing": docxml:length(${QNS.w}spacing/@${QNS.w}val, 'twip'),
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
			if ($isBold('simple')) then element ${QNS.w}b {} else (),
			if ($isBold('complex')) then element ${QNS.w}bCs {} else (),
			if ($isItalic('simple')) then element ${QNS.w}i {} else (),
			if ($isItalic('complex')) then element ${QNS.w}iCs {} else (),
			if ($isSmallCaps) then element ${QNS.w}smallCaps {} else (),
			if ($isCaps) then element ${QNS.w}caps {} else (),
			if ($verticalAlign) then element ${QNS.w}vertAlign {
				attribute ${QNS.w}val { $verticalAlign }
			} else (),
			if ($language) then element ${QNS.w}lang {
				attribute ${QNS.w}val { $language }
			} else (),
			if (exists($fontSize('simple'))) then element ${QNS.w}sz {
				attribute ${QNS.w}val { $fontSize('simple')('hpt') }
			} else (),
			if (exists($fontSize('complex'))) then element ${QNS.w}szCs {
				attribute ${QNS.w}val { $fontSize('complex')('hpt') }
			} else (),
			if ($minimumKerningFontSize) then element ${QNS.w}kern {
				attribute ${QNS.w}val { $minimumKerningFontSize }
			} else (),
			if ($isStrike) then element ${QNS.w}strike {} else (),
			if ($spacing) then element ${QNS.w}spacing {
				attribute ${QNS.w}val { $spacing }
			} else (),
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
			isBold: explodeSimpleOrComplex(data.isBold || false),
			verticalAlign: data.verticalAlign || null,
			isItalic: explodeSimpleOrComplex(data.isItalic || false),
			isSmallCaps: data.isSmallCaps || false,
			isCaps: data.isCaps || false,
			fontSize: explodeSimpleOrComplex(data.fontSize || null),
			minimumKerningFontSize: data.minimumKerningFontSize ? data.minimumKerningFontSize.hpt : null,
			isStrike: data.isStrike || false,
			spacing: data.spacing ? data.spacing.twip : null,
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
