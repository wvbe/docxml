import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';

export class Footnotes extends UnhandledXmlFile {
	public static contentType = ContentType.footnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<Footnotes> {
		return new Footnotes(location, await archive.readText(location));
	}
}
