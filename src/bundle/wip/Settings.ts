import * as path from 'https://deno.land/std@0.146.0/path/mod.ts';

import { UnhandledXmlFile, XmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';
import { Relationships } from '../Relationships.ts';

export class Settings extends UnhandledXmlFile {
	public static contentType = ContentType.settings;

	relationships: Relationships;

	private constructor(location: string, xml: string, relationships: Relationships) {
		super(location, xml);
		this.relationships = relationships;
	}

	public getRelated(): XmlFile[] {
		return [this, ...this.relationships.getRelated()];
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<Settings> {
		let relationships;

		const relationshipsLocation = `${path.dirname(location)}/_rels/${path.basename(location)}.rels`;
		try {
			relationships = await Relationships.fromArchive(archive, relationshipsLocation);
		} catch (error: unknown) {
			console.error(
				'Warning, relationships could not be resolved\n' +
					((error as Error).stack || (error as Error).message),
			);
		}
		return new Settings(
			location,
			await archive.readText(location),
			relationships || new Relationships(relationshipsLocation),
		);
	}
}
