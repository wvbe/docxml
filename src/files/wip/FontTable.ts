import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { Archive } from '../../classes/Archive.ts';
import { ContentType } from '../../enums.ts';

export class FontTable extends UnhandledXmlFile {
	public static contentType = ContentType.fontTable;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<FontTable> {
		return new FontTable(location, await archive.readText(location));
	}
}
