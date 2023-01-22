import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class FontTableXml extends UnhandledXmlFile {
	public static contentType = FileMime.fontTable;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<FontTableXml> {
		return new FontTableXml(location, await archive.readText(location));
	}
}
