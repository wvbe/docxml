import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
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
export type ThemeElements = {
	fontScheme: FontScheme;
}

export type FontScheme = {
	name: string;
	majorFont: {
		latinFont: LatinFont;
		otherFonts: Font[];
	};
	minorFont: {
		latinFont: LatinFont;
		otherFonts: Font[]
	}
}

export type Font = {
	script?: string;
	typeface: string;
}

export interface LatinFont extends Font {
	panose: string;
}

export class ThemeXml extends XmlFile {
	public static contentType = FileMime.theme;
	public readonly themeElements: ThemeElements;

	public constructor(location: string) {
		super(location);
		const newThemeElements = {} as ThemeElements;
		this.themeElements = newThemeElements;
	}

	public toNode(): Document {
		return create(
			`<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
			{
				element a:themeElements {
					element a:fontScheme {
						attribute name { $fontSchemeName },
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
				fontSchemeName: this.themeElements.fontScheme.name,
				majorFontLatinTypeface: this.themeElements.fontScheme.majorFont.latinFont.typeface,
				majorFontLatinPanose: this.themeElements.fontScheme.majorFont.latinFont.panose,
				majorOtherFonts: this.themeElements.fontScheme.majorFont.otherFonts,
				minorFontLatinTypeface: this.themeElements.fontScheme.minorFont.latinFont.typeface,
				minorFontLatinPanose: this.themeElements.fontScheme.minorFont.latinFont.panose,
				minorOtherFonts: this.themeElements.fontScheme.minorFont.otherFonts
			},
			true
		);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location?: string, xml?: Document): Promise<ThemeXml> {
		// If a location is supplied, use that, otherwise use the default location for theme files.
		location = location ?? 'word/theme/theme1.xml';
		const themeDocument = archive.hasFile(location) ? await archive.readXml(location) : xml;
		const fontScheme: Record<string, string | Font[]> = evaluateXPathToMap(`
			//${QNS.a}theme/${QNS.a}themeElements/${QNS.a}fontScheme/map {
				"name": @name/string(),
				"majorFontLatinTypeface": ${QNS.a}majorFont/${QNS.a}latin/@typeface/string(),
				"majorFontLatinPanose": ${QNS.a}majorFont/${QNS.a}latin/@panose/string(),
				"majorFontOthers": array{${QNS.a}majorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}},
				"minorFontLatinTypeface": ${QNS.a}minorFont/${QNS.a}latin/@typeface/string(),
				"minorFontLatinPanose": ${QNS.a}minorFont/${QNS.a}latin/@panose/string(),
				"minorFontOthers": array{${QNS.a}minorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}}
			}
		`, themeDocument);

		const majorFontOthersCollection: Font[] = typeof fontScheme["majorFontOthers"] !== 'string'
			? fontScheme["majorFontOthers"].map((font: Font) => {
				return { script: font["script"], typeface: font["typeface"] } as Font
			}) : [{ script: '', typeface: '' } as Font];


		const minorFontOthersCollection: Font[] = typeof fontScheme["minorFontOthers"] !== 'string'
			? fontScheme["minorFontOthers"].map((font: Font) => {
				return { script: font["script"], typeface: font["typeface"] } as Font
			}) : [{ script: '', typeface: '' } as Font];

		const newFontScheme: FontScheme = {
			name: fontScheme["name"] as string,
			majorFont: {
				latinFont: {
					typeface: fontScheme["majorFontLatinTypeface"],
					panose: fontScheme["majorFontLatinPanose"]
				} as LatinFont,
				otherFonts: majorFontOthersCollection
			},
			minorFont: {
				latinFont: {
					typeface: fontScheme["minorFontLatinTypeface"],
					panose: fontScheme["minorFontLatinPanose"]
				} as LatinFont,
				otherFonts: minorFontOthersCollection
			}
		};

		const newTheme = new ThemeXml(location);
		newTheme.themeElements.fontScheme = newFontScheme;
		return Promise.resolve(newTheme);
	}
}
