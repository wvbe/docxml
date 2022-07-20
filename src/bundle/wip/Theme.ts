import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';

export class Theme extends UnhandledXmlFile {
	public static contentType = ContentType.theme;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<Theme> {
		return new Theme(location, await archive.readText(location));
	}
}
