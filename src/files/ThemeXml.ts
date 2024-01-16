import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToArray, evaluateXPathToMap } from '../utilities/xquery.ts';
import { create } from '../utilities/dom.ts';

/**
 * Represents the various 'scheme' elements that comprise a theme.
 *
 * Currently, only FontScheme is implemented. It functions as a fallback for
 * determining which fonts to apply when the StylesXml cannot determine which
 * font to apply for the required Normal style in MS Word.
 *
 * @TODO Implement ColorScheme and FormatScheme
 */

export type Font = {
	script?: string;
	typeface: string;
}

export interface LatinFont extends Font {
	typeface: string;
	/**
	 * The Panose system is used by ooxml and other word processors as a reference
	 * system to classify fonts based on their attributes. e.g. Family, Serif, Weight, etc.
	 * The system represents 10 attributes with a single (hex) digit for each,
	 * with each attribute separated by a 0.
	 */
	panose: string;
}

export type FontScheme = {
	majorFont: {
		latinFont: LatinFont;
		otherFonts: Font[];
	};
	minorFont: {
		latinFont: LatinFont;
		otherFonts: Font[]
	}
}

export class ThemeXml extends XmlFile {
	public static contentType = FileMime.theme;
	public fontScheme: FontScheme;

	public constructor(location: string) {
		const fallbackLatinFont = {
			typeface: 'Times New Roman',
			panose: '020206030504020304',
		}
		super(location);
		this.fontScheme = {
			majorFont: {
				latinFont: fallbackLatinFont,
				otherFonts: []
			},
			minorFont: {
				latinFont: fallbackLatinFont,
				otherFonts: []
			}
		}
	}

	public setMajorFonts(latin: LatinFont, others: Font[]): void {
		this.fontScheme.majorFont.latinFont = latin;
		this.fontScheme.majorFont.otherFonts = others;
	};

	public getMajorFonts() {
		return this.fontScheme.majorFont
	}

	public setMinorFonts(latin: LatinFont, others: Font[]): void {
		this.fontScheme.minorFont.latinFont = latin;
		this.fontScheme.minorFont.otherFonts = others;
	}

	public getMinorFonts() {
		return this.fontScheme.minorFont;
	}

	public toNode(): Document {
		return create(
			`<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
			{
				element a:themeElements {
					element a:fontScheme {
						element a:majorFont {
							element a:latin {
								attribute typeface { $majorFontLatinTypeface },
								attribute panose { $majorFontLatinPanose }
							},
							for $font in array:flatten($majorOtherFonts)
							return element a:font {
								attribute script { $font('script') },
								attribute typeface { $font('typeface') }
							}
						},
						element a:minorFont {
							element a:latin {
								attribute typeface { $minorFontLatinTypeface },
								attribute panose { $minorFontLatinPanose }
							},
							for $font in array:flatten($minorOtherFonts)
								return element a:font {
								attribute script { $font('script') },
								attribute typeface { $font('typeface') }
							}
						}
					}
				}
			}</a:theme>`,
			{
				majorFontLatinTypeface: this.fontScheme.majorFont.latinFont.typeface,
				majorFontLatinPanose: this.fontScheme.majorFont.latinFont.panose,
				majorOtherFonts: this.fontScheme.majorFont.otherFonts,
				minorFontLatinTypeface: this.fontScheme.minorFont.latinFont.typeface,
				minorFontLatinPanose: this.fontScheme.minorFont.latinFont.panose,
				minorOtherFonts: this.fontScheme.minorFont.otherFonts
			},
			true,
		);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location?: string): Promise<ThemeXml> {
		// If a location is supplied, use that, otherwise use the default location for theme files.
		location = location ?? 'word/theme/theme1.xml';
		const themeDocument = await archive.readXml(location);
		const test = evaluateXPathToMap(`
			./${QNS.a}theme/${QNS.a}themeElements/${QNS.a}fontScheme/map {
				"majorFontLatinTypeface": ${QNS.a}majorFont/${QNS.a}latin/@typeface/string(),
				"majorFontLatinPanose": ${QNS.a}majorFont/${QNS.a}latin/@panose/string(),
				"majorFontOthers": array{${QNS.a}majorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}},
				"minorFontLatinTypeface": ${QNS.a}minorFont/${QNS.a}latin/@typeface/string(),
				"minorFontLatinPanose": ${QNS.a}minorFont/${QNS.a}latin/@panose/string(),
				"minorFontOthers": array{${QNS.a}minorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}}
			}
		// `, themeDocument)
		// .map(({
		// 	majorFontLatinTypeface,
		// 	majorFontLatinPanose,
		// 	majorFontOthers,
		// 	minorFontLatinTypeface,
		// 	minorFontLatinPanose,
		// 	minorFontOthers
		// }) => {
		// 	return {
		// 		majorFont: {
		// 			latinFont: {
		// 				typeface: majorFontLatinTypeface,
		// 				panose: majorFontLatinPanose
		// 			},
		// 			otherFonts: majorFontOthers
		// 		},
		// 		minorFont: {
		// 			latinFont: {
		// 				typeface: minorFontLatinTypeface,
		// 				panose: minorFontLatinPanose
		// 			},
		// 			otherFonts: minorFontOthers
		// 		}
		// 	} as FontScheme
		// })
		// }


		const newTheme = new ThemeXml(location);
		console.log(test);
		// newTheme.fontScheme = fontScheme;
		return Promise.resolve(newTheme);
	}
}
