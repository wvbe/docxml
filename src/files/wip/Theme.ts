import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ContentType } from '../../enums.ts';

export class Theme extends UnhandledXmlFile {
	public static contentType = ContentType.theme;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Theme> {
		return new Theme(location, await archive.readText(location));
	}
}
