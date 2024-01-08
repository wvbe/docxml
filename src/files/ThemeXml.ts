import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap} from '../utilities/xquery.ts';

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
	fontScheme: FontScheme | null;
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
	typeface: string;
	script?: string;
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
	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<ThemeXml> {
		const themeDocument = await archive.readXml(location);
		const fontScheme: Record<string, string | Font[]> = evaluateXPathToMap(`
			//${QNS.a}fontScheme/map {
				"name": @name/string(),
				"majorFontLatinTypeface": ${QNS.a}majorFont/${QNS.a}latin/@typeface/string(),
				"majorFontLatinPanose": ${QNS.a}majorFont/${QNS.a}latin/@panose/string(),
				"majorFontOthers": array{${QNS.a}majorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}},
				"minorFontLatinTypeface": ${QNS.a}minorFont/${QNS.a}latin/@typeface/string(),
				"minorFontLatinPanose": ${QNS.a}minorFont/${QNS.a}latin/@panose/string(),
				"minorFontOthers": array{${QNS.a}minorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}}
			}
		`, themeDocument);

		const newFontScheme: FontScheme = {
			name: fontScheme["name"] as string,
			majorFont: {
				latinFont: {
					typeface: fontScheme["majorFontLatinTypeface"],
					panose: fontScheme["majorFontLatinPanose"]
				} as LatinFont,
				otherFonts: typeof fontScheme["majorFontOthers"] !== 'string' ? fontScheme["majorFontOthers"].map((font: Font) => {
					const newFont: Font = { script: font["script"],  typeface: font["typeface"] };
					return newFont;
				}) as Font[] : [{ script: '', typeface: ''}] as Font[]
			},
			minorFont: {
				latinFont: {
					typeface: fontScheme["minorFontLatinTypeface"],
					panose: fontScheme["minorFontLatinPanose"]
				} as LatinFont,
				otherFonts: typeof fontScheme["minorFontOthers"] !== 'string' ? fontScheme["minorFontOthers"].map((font: Font) => {
					const newFont: Font = { script: font["script"], typeface: font["typeface"] };
					return newFont;
				}) as Font[] : [{ script: '', typeface: ''}] as Font[]
			}
		}

		const newTheme = new ThemeXml(location);
		newTheme.themeElements.fontScheme = newFontScheme;
		return Promise.resolve(newTheme);
	}
}
