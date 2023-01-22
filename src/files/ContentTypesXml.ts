import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToArray } from '../utilities/xquery.ts';

type ContentTypeOverride = {
	partName: string;
	contentType: FileMime;
};

type ContentTypeDefault = {
	extension: string;
	contentType: string | FileMime;
};

export class ContentTypesXml extends XmlFile {
	readonly #defaults: Array<ContentTypeDefault> = [
		{
			extension: 'rels',
			contentType: FileMime.rels,
		},
		{
			extension: 'xml',
			contentType: FileMime.xml,
		},
	];
	readonly #overrides: Array<ContentTypeOverride> = [];

	public constructor(location: string) {
		super(location);
	}

	/**
	 * Add a default content type association for a file extension.
	 */
	public addDefault(extension: string, contentType: string | FileMime): void {
		const exists = this.#defaults.findIndex((item) => item.extension === extension);
		if (exists >= 0) {
			this.#defaults.splice(exists, 1);
		}
		this.#defaults.push({ extension, contentType });
	}

	/**
	 * Add multiple default content type/file extension associations. Useful for cloning
	 * an existing content type register.
	 */
	public addDefaults(defaults: Array<ContentTypeDefault>): void {
		defaults.forEach(({ extension, contentType }) => this.addDefault(extension, contentType));
	}

	public get defaults(): Array<ContentTypeDefault> {
		return this.#defaults;
	}

	public addOverride(partName: string, contentType: FileMime) {
		const exists = this.#overrides.findIndex((item) => item.partName === partName);
		if (exists >= 0) {
			this.#overrides.splice(exists, 1);
		}
		this.#overrides.push({ partName, contentType });
	}

	protected toNode(): Document {
		return create(
			`
				element ${QNS.contentTypesDocument}Types {
					for $default in array:flatten($defaults)
						return element ${QNS.contentTypesDocument}Default {
							attribute Extension { $default('extension') },
							attribute ContentType { $default('contentType') }
						},
					for $override in array:flatten($overrides)
						return element ${QNS.contentTypesDocument}Override {
							attribute PartName { concat("/", $override('partName')) },
							attribute ContentType { $override('contentType') }
						}
				}
			`,
			{
				defaults: this.#defaults,
				overrides: this.#overrides,
			},
			true,
		);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string) {
		const dom = await archive.readXml(location);
		const instance = new ContentTypesXml(location);

		evaluateXPathToArray(
			`
				array { /*/Override/map{
					"partName": string(@PartName),
					"contentType": string(@ContentType)
				}}
			`,
			dom,
		).forEach(({ partName, contentType }: ContentTypeOverride) =>
			instance.addOverride(
				// In JS, all file names are relative paths (from the DOCX root). In DOCX, all file names
				// are stored with a preceding "/".
				partName.startsWith('/') ? partName.substring(1) : partName,
				contentType,
			),
		);

		evaluateXPathToArray(
			`
				array { /*/Default/map{
					"extension": string(@Extension),
					"contentType": string(@ContentType)
				}}
			`,
			dom,
		).forEach(({ extension, contentType }) => instance.addDefault(extension, contentType));

		return instance;
	}
}
