import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class ThemeXml extends UnhandledXmlFile {
	public static contentType = FileMime.theme;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<ThemeXml> {
		return new ThemeXml(location, await archive.readText(location));
	}
}
