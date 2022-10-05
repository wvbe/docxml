import * as path from 'https://deno.land/std@0.146.0/path/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { Paragraph } from '../components/Paragraph.ts';
import { Section } from '../components/Section.ts';
import { Table } from '../components/Table.ts';
import { BundleFile, ContentType } from '../enums.ts';
import { createChildComponentsFromNodes } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToNodes } from '../utilities/xquery.ts';
import { Comments } from './Comments.ts';
import { File, Relationships, RelationshipType } from './Relationships.ts';
import { Settings } from './Settings.ts';
import { Styles } from './Styles.ts';

export type OfficeDocumentChild = Paragraph | Table | Section;

export type OfficeDocumentRoot =
	| OfficeDocumentChild
	| OfficeDocumentChild[]
	| Promise<OfficeDocumentChild[]>;
export class OfficeDocument extends XmlFile {
	public static contentType = ContentType.mainDocument;

	public readonly relationships: Relationships;
	#root: OfficeDocumentRoot | null = null;

	public constructor(
		location: string,
		relationships = new Relationships(
			`${path.dirname(location)}/_rels/${path.basename(location)}.rels`,
		),
	) {
		super(location);
		this.relationships = relationships;

		// Some features don't work when there is no styles relationship (eg. change tracking styles).
		// However, ensuring that object exists should be the responsibity of those features.
		Object.defineProperty(this, '_styles', {
			enumerable: false,
		});
	}

	#styles: Styles | null = null;

	/**
	 * The API representing "styles.xml" and all the text/paragraph/table styles associated with this document.
	 */
	public get styles(): Styles {
		// @TODO Invalidate the cached _styles whenever that relationship changes.
		if (!this.#styles) {
			this.#styles = this.relationships.ensureRelationship(
				RelationshipType.styles,
				() => new Styles(BundleFile.styles),
			);
		}
		return this.#styles;
	}

	#settings: Settings | null = null;

	/**
	 * The API representing "settings.xml" and all the settings associated with this document.
	 */
	public get settings(): Settings {
		// @TODO Invalidate the cached _settings whenever that relationship changes.
		if (!this.#settings) {
			this.#settings = this.relationships.ensureRelationship(
				RelationshipType.settings,
				() => new Settings(BundleFile.settings),
			);
		}
		return this.#settings;
	}

	#comments: Comments | null = null;

	/**
	 * The API representing "comments.xml" and all the comments associated with this document.
	 */
	public get comments(): Comments {
		if (!this.#comments) {
			this.#comments = this.relationships.ensureRelationship(
				RelationshipType.comments,
				() => new Comments(BundleFile.comments),
			);
		}
		return this.#comments;
	}

	/**
	 * The components normalized from #root, which is potentially arrayed, promised, array promised etc.
	 */
	public get children(): Promise<OfficeDocumentChild[]> {
		if (!this.#root) {
			throw new Error(`Document is empty!`);
		}
		return Promise.resolve(this.#root)
			.then((root) => {
				return Array.isArray(root) ? Promise.all(root) : [root];
			})
			.then((zz) =>
				zz.reduce<Promise<OfficeDocumentChild[]>>(async function flatten(
					flatPromise,
					childPromise,
				): Promise<OfficeDocumentChild[]> {
					const child = await childPromise;
					const flat = await flatPromise;
					return Array.isArray(child)
						? [...flat, ...(await child.reduce(flatten, Promise.resolve([])))]
						: [...flat, child];
				},
				Promise.resolve([])),
			);
	}

	protected async toNode(): Promise<Document> {
		const children = await this.children;
		return create(
			`
				<w:document ${ALL_NAMESPACE_DECLARATIONS}>
					<w:body>
						{$children}
					</w:body>
				</w:document>
			`,
			{
				children: await Promise.all(children.map((child) => child.toNode([this]))),
			},
			true,
		);
	}

	/**
	 * Set the contents of the document
	 */
	public set(root: OfficeDocumentRoot): void {
		this.#root = root;
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
	public static async fromArchive(archive: Archive, location: string): Promise<OfficeDocument> {
		const relationships = await Relationships.fromArchive(
			archive,
			`${path.dirname(location)}/_rels/${path.basename(location)}.rels`,
		);
		const doc = new OfficeDocument(location, relationships);
		const dom = await archive.readXml(location);
		const sections = evaluateXPathToNodes(
			`/*/${QNS.w}body/(${QNS.w}p/${QNS.w}pPr/${QNS.w}sectPr | ${QNS.w}sectPr)`,
			dom,
		);
		doc.set(
			sections.length
				? sections.map((node) => Section.fromNode(node))
				: createChildComponentsFromNodes<Table | Paragraph>(
						[Table.name, Paragraph.name],
						evaluateXPathToNodes(`/*/${QNS.w}body/*`, dom),
				  ),
		);
		return doc;
	}
}
