import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';

export class ExtendedProperties extends UnhandledXmlFile {
	public static contentType = ContentType.extendedProperties;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(
		archive: ZipArchive,
		location: string,
	): Promise<ExtendedProperties> {
		return new ExtendedProperties(location, await archive.readText(location));
	}
}
