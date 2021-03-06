import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';

export class FontTable extends UnhandledXmlFile {
	public static contentType = ContentType.fontTable;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<FontTable> {
		return new FontTable(location, await archive.readText(location));
	}
}
