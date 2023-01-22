import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class ExtendedPropertiesXml extends UnhandledXmlFile {
	public static contentType = FileMime.extendedProperties;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(
		archive: Archive,
		location: string,
	): Promise<ExtendedPropertiesXml> {
		return new ExtendedPropertiesXml(location, await archive.readText(location));
	}
}
