import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { Archive } from '../../classes/Archive.ts';
import { ContentType } from '../../enums.ts';

export class Header extends UnhandledXmlFile {
	public static contentType = ContentType.header;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Header> {
		return new Header(location, await archive.readText(location));
	}
}
