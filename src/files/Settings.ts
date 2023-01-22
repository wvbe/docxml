import * as path from 'https://deno.land/std@0.170.0/path/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { File, Relationships } from './Relationships.ts';

export type SettingsI = {
	isTrackChangesEnabled: boolean;
};

const DEFAULT_SETTINGS: SettingsI = {
	isTrackChangesEnabled: false,
};

export class Settings extends XmlFile implements SettingsI {
	public static contentType = FileMime.settings;

	public readonly relationships: Relationships;

	public isTrackChangesEnabled = DEFAULT_SETTINGS.isTrackChangesEnabled;

	public constructor(
		location: string,
		relationships = new Relationships(
			`${path.dirname(location)}/_rels/${path.basename(location)}.rels`,
		),
		settings: SettingsI = DEFAULT_SETTINGS,
	) {
		super(location);
		this.relationships = relationships;
		Object.assign(this, settings);
	}

	/**
	 * Set a setting.
	 */
	public set(key: keyof SettingsI, value: SettingsI[typeof key]): void {
		this[key] = value;
	}

	/**
	 * Get a setting.
	 */
	public get(key: keyof SettingsI): SettingsI[typeof key] {
		return this[key];
	}

	protected toNode(): Document {
		return create(
			`<w:settings ${ALL_NAMESPACE_DECLARATIONS}>
				{
					if ($isTrackChangesEnabled) then element ${QNS.w}trackRevisions {
						(: attribute ${QNS.w}val { $isTrackChangesEnabled } :)
					} else ()

				}
			</w:settings>`,
			{
				isTrackChangesEnabled: this.isTrackChangesEnabled,
			},
			true,
		);
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): File[] {
		return [this, ...this.relationships.getRelated()];
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<Settings> {
		let relationships;

		const relationshipsLocation = `${path.dirname(location)}/_rels/${path.basename(location)}.rels`;
		try {
			relationships = await Relationships.fromArchive(archive, relationshipsLocation);
		} catch (_error: unknown) {
			// console.error(
			// 	'Warning, relationships could not be resolved\n' +
			// 		((error as Error).stack || (error as Error).message),
			// );
		}

		const settings = evaluateXPathToMap<SettingsI>(
			`/${QNS.w}settings/map {
				"isTrackChangesEnabled": docxml:ct-on-off(./${QNS.w}trackChanges)
			}`,
			await archive.readXml(location),
		);
		return new Settings(
			location,
			relationships || new Relationships(relationshipsLocation),
			settings,
		);
	}
}
