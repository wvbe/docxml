import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ContentType } from '../../enums.ts';

export class Footer extends UnhandledXmlFile {
	public static contentType = ContentType.footer;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Footer> {
		return new Footer(location, await archive.readText(location));
	}
}
