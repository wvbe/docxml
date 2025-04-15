import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class FootnotesXml extends UnhandledXmlFile {
	public static override contentType = FileMime.footnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(archive: Archive, location: string): Promise<FootnotesXml> {
		return new FootnotesXml(location, await archive.readText(location));
	}
}
