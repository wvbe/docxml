import { XmlFile } from '../../classes/XmlFile.ts';
import { ZipArchive } from '../../classes/ZipArchive.ts';
import { ContentType } from '../../types.ts';
import { ALL_NAMESPACE_DECLARATIONS, create } from '../../util/dom.ts';
import { evaluateXPathToArray } from '../../util/xquery.ts';

export class CoreProperties extends XmlFile {
	public static contentType = ContentType.coreProperties;

	public created: Date = new Date();
	public creator: string | null = null;
	public description: string | null = null;
	public keywords: string[] = [];
	public lastModifiedBy: string | null = null;
	public modified: Date = new Date();
	public revision = 1;
	public subject: string | null = null;
	public title: string | null = null;

	public constructor(location: string) {
		super(location);
	}

	public toNode(): Document {
		return create(
			`
				<cp:coreProperties ${ALL_NAMESPACE_DECLARATIONS}>
					<dc:title>{ $title }</dc:title>
					<dc:subject>{ $subject }</dc:subject>
					<dc:creator>{ $creator }</dc:creator>
					<cp:keywords>{ $keywords }</cp:keywords>
					<dc:description>{ $description }</dc:description>
					<cp:lastModifiedBy>{ $lastModifiedBy }</cp:lastModifiedBy>
					<cp:revision>{ $revision }</cp:revision>
					<dcterms:created xsi:type="dcterms:W3CDTF">{ $created }</dcterms:created>
					<dcterms:modified xsi:type="dcterms:W3CDTF">{ $modified }</dcterms:modified>
				</cp:coreProperties>
			`,
			{
				title: this.title,
				subject: this.subject,
				creator: this.creator,
				keywords: this.keywords.join(' '),
				description: this.description,
				lastModifiedBy: this.lastModifiedBy,
				revision: this.revision,
				created: this.created.toISOString(),
				modified: this.modified.toISOString(),
			},
			true,
		);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<CoreProperties> {
		const dom = await archive.readXml(location);
		const instance = new CoreProperties(location);
		Object.assign(
			instance,
			evaluateXPathToArray(
				`
				array{/*/Override/map{
					"partName": string(@PartName),
					"contentType": string(@ContentType)
				}}
			`,
				dom,
			),
		);
		return instance;
	}
}
