import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class Footer extends UnhandledXmlFile {
	public static contentType = FileMime.footer;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Footer> {
		return new Footer(location, await archive.readText(location));
	}
}
