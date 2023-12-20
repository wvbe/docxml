import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap} from '../utilities/xquery.ts';

export type FontScheme = {
	name: string | undefined;
	majorFont: {
		latinFont: LatinFont;
		otherFonts?: Font | Font[];
	};
	minorFont: {
		latinFont: LatinFont;
		otherFonts?: Font | Font[]
	}
}

export type Font = {
	typeFace: string;
	script?: string;
}

export interface LatinFont extends Font {
	panose: string;
}

export class ThemeXml extends XmlFile {
	public static contentType = FileMime.theme;
	public static fontScheme: FontScheme;
	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<ThemeXml> {
		const themeDocument = await archive.readXml(location);
		const fontScheme = evaluateXPathToMap(`
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

		console.log(fontScheme["name"]);
		return Promise.resolve(new ThemeXml(location));
	}
}
