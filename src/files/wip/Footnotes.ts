import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { Archive } from '../../classes/Archive.ts';
import { ContentType } from '../../enums.ts';

export class Footnotes extends UnhandledXmlFile {
	public static contentType = ContentType.footnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Footnotes> {
		return new Footnotes(location, await archive.readText(location));
	}
}
