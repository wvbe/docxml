import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class EndnotesXml extends UnhandledXmlFile {
	public static contentType = FileMime.endnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<EndnotesXml> {
		return new EndnotesXml(location, await archive.readText(location));
	}
}
