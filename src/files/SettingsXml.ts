import * as path from 'https://deno.land/std@0.187.0/path/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime, RelationshipType } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { File, RelationshipsXml } from './RelationshipsXml.ts';

export type SettingsI = {
	isTrackChangesEnabled: boolean;
	/**
	 * When set to `true`, the file will use different headers between odd and even pages, or leave them
	 * empty. When set to `false`, odd and even pages will get the same header (the one set for "odd").
	 *
	 * Defaults to `false`
	 */
	evenAndOddHeaders: boolean;

	attachedTemplate: string | null;
};

const DEFAULT_SETTINGS: SettingsI = {
	isTrackChangesEnabled: false,
	evenAndOddHeaders: false,
	attachedTemplate: null,
};

enum SettingType {
	OnOff,
	Relationship,
}

type SettingMeta =
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.OnOff;
	  }
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.Relationship;
			ooxmlRelationshipType: RelationshipType;
	  };
const settingsMeta: Array<SettingMeta> = [
	{
		docxmlName: 'isTrackChangesEnabled',
		ooxmlLocalName: 'trackRevisions',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'evenAndOddHeaders',
		ooxmlLocalName: 'evenAndOddHeaders',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'attachedTemplate',
		ooxmlLocalName: 'attachedTemplate',
		ooxmlType: SettingType.Relationship,
		ooxmlRelationshipType: RelationshipType.attachedTemplate,
	},
];

export class SettingsXml extends XmlFile {
	public static contentType = FileMime.settings;

	public readonly relationships: RelationshipsXml;

	#props: SettingsI;

	public constructor(
		location: string,
		relationships = new RelationshipsXml(
			`${path.dirname(location)}/_rels/${path.basename(location)}.rels`,
		),
		settings: SettingsI = DEFAULT_SETTINGS,
	) {
		super(location);
		this.relationships = relationships;
		this.#props = Object.assign({}, settings);
	}

	/**
	 * Set a setting.
	 */
	public set<Key extends keyof SettingsI>(key: Key, value: SettingsI[Key]): void {
		const meta = settingsMeta.find((meta) => meta.docxmlName === key);
		if (!meta) {
			throw new Error(`Unsupported setting "${key}"`);
		}
		if (meta.ooxmlType === SettingType.Relationship) {
			this.#props[key] = value
				? (this.relationships.add(meta.ooxmlRelationshipType, value as string) as SettingsI[Key])
				: value;
		} else {
			this.#props[key] = value;
		}
	}

	/**
	 * Get a setting.
	 */
	public get<Key extends keyof SettingsI>(key: Key): SettingsI[Key] {
		const meta = settingsMeta.find((meta) => meta.docxmlName === key);
		if (!meta) {
			throw new Error(`Unsupported setting "${key}"`);
		}
		if (meta.ooxmlType === SettingType.Relationship) {
			return this.#props[key]
				? (this.relationships.getTarget(this.#props[key] as string) as SettingsI[Key])
				: (this.#props[key] as SettingsI[Key]);
		} else {
			return this.#props[key];
		}
	}

	/**
	 * Returns a list of setting key values (similar to `Object.entries`). Useful for cloning these
	 * settings into a new instance.
	 */
	public entries() {
		return Object.keys(this.#props).map((key) => [key, this.get(key as keyof SettingsI)]) as Array<
			[keyof SettingsI, SettingsI[keyof SettingsI]]
		>;
	}

	protected toNode(): Document {
		return create(
			`<w:settings ${ALL_NAMESPACE_DECLARATIONS}>
				{
					if ($isTrackChangesEnabled) then element ${QNS.w}trackRevisions {
						(: attribute ${QNS.w}val { $isTrackChangesEnabled } :)
					} else (),
					if ($evenAndOddHeaders) then element ${QNS.w}evenAndOddHeaders {
						attribute ${QNS.w}val { $evenAndOddHeaders }
					} else ()

				}
			</w:settings>`,
			this.#props,
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
	public static async fromArchive(archive: Archive, location: string): Promise<SettingsXml> {
		let relationships;

		const relationshipsLocation = `${path.dirname(location)}/_rels/${path.basename(location)}.rels`;
		try {
			relationships = await RelationshipsXml.fromArchive(archive, relationshipsLocation);
		} catch (_error: unknown) {
			// console.error(
			// 	'Warning, relationships could not be resolved\n' +
			// 		((error as Error).stack || (error as Error).message),
			// );
		}

		const settings = evaluateXPathToMap<SettingsI>(
			`/${QNS.w}settings/map {
				"isTrackChangesEnabled": docxml:ct-on-off(./${QNS.w}trackChanges),
				"evenAndOddHeaders": docxml:ct-on-off(./${QNS.w}evenAndOddHeaders)
			}`,
			await archive.readXml(location),
		);
		return new SettingsXml(
			location,
			relationships || new RelationshipsXml(relationshipsLocation),
			settings,
		);
	}
}
