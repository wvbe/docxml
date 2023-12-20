import { Archive } from '../classes/Archive.ts';
import { UnhandledXmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';

type FontScheme = {
	name: string | "Office";
	majorFont: {
		latinFont: LatinFont;
		otherFonts?: Font | Font[];
	};
	minorFont: {
		latinFont: LatinFont;
		otherFonts?: Font | Font[]
	}
}

type Font = {
	typeFace: string;
	script?: string;
}

interface LatinFont extends Font {
	panose: string;
}

export class ThemeXml extends UnhandledXmlFile {
	public static contentType = FileMime.theme;
	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<ThemeXml> {
		return new ThemeXml(location, await archive.readText(location));
	}
}
