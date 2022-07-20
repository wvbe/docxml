import { XmlFile } from '../classes/XmlFile.ts';
import { ZipArchive } from '../classes/ZipArchive.ts';
import { ContentType } from '../types.ts';
import { create, QNS } from '../util/dom.ts';
import { evaluateXPathToArray } from '../util/xquery.ts';

type ContentTypeOverride = {
	partName: string;
	contentType: ContentType;
};

type ContentTypeDefault = {
	extension: string;
	contentType: ContentType;
};

export class ContentTypes extends XmlFile {
	public readonly defaults: Array<ContentTypeDefault> = [
		{
			extension: 'rels',
			contentType: ContentType.rels,
		},
		{
			extension: 'xml',
			contentType: ContentType.xml,
		},
	];
	public readonly overrides: Array<ContentTypeOverride> = [];

	public constructor(location: string) {
		super(location);
	}

	public addDefault(extension: string, contentType: ContentType) {
		const exists = this.defaults.findIndex((item) => item.extension === extension);
		if (exists >= 0) {
			this.defaults.splice(exists, 1);
		}
		this.defaults.push({ extension, contentType });
	}

	public addOverride(partName: string, contentType: ContentType) {
		const exists = this.overrides.findIndex((item) => item.partName === partName);
		if (exists >= 0) {
			this.overrides.splice(exists, 1);
		}
		this.overrides.push({ partName, contentType });
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
				defaults: this.defaults,
				overrides: this.overrides,
			},
			true,
		);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string) {
		const dom = await archive.readXml(location);
		const instance = new ContentTypes(location);

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
