import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class Theme extends UnhandledXmlFile {
	public static contentType = FileMime.theme;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Theme> {
		return new Theme(location, await archive.readText(location));
	}
}
