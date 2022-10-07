import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class Endnotes extends UnhandledXmlFile {
	public static contentType = FileMime.endnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Endnotes> {
		return new Endnotes(location, await archive.readText(location));
	}
}
