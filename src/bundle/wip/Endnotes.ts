import { UnhandledXmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';

export class Endnotes extends UnhandledXmlFile {
	public static contentType = ContentType.endnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<Endnotes> {
		return new Endnotes(location, await archive.readText(location));
	}
}
