import { Archive } from '../../classes/Archive.ts';
import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { FileMime } from '../../enums.ts';

export class WebSettingsXml extends UnhandledXmlFile {
	public static contentType = FileMime.webSettings;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<WebSettingsXml> {
		return new WebSettingsXml(location, await archive.readText(location));
	}
}
