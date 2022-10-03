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

export class OfficeDocument extends XmlFile {
	public static contentType = ContentType.mainDocument;

	public readonly relationships: Relationships;
	public readonly children: OfficeDocumentChild[] = [];

	public constructor(
		location: string,
		relationships = new Relationships(
			`${path.dirname(location)}/_rels/${path.basename(location)}.rels`,
		),
		children: OfficeDocumentChild[] = [],
	) {
		super(location);
		this.relationships = relationships;
		this.children = children;

		// Some features don't work when there is no styles relationship (eg. change tracking styles).
		// However, ensuring that object exists should be the responsibity of those features.
		Object.defineProperty(this, '_styles', {
			enumerable: false,
		});
	}

	#styles: Styles | null = null;
	public get styles() {
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
	public get settings() {
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
	public get comments() {
		if (!this.#comments) {
			this.#comments = this.relationships.ensureRelationship(
				RelationshipType.comments,
				() => new Comments(BundleFile.comments),
			);
		}
		return this.#comments;
	}

	protected toNode(): Document {
		return create(
			`
				<w:document ${ALL_NAMESPACE_DECLARATIONS}>
					<w:body>
						{$children}
					</w:body>
				</w:document>
			`,
			{
				children: this.children.map((child) => child.toNode([this])),
			},
			true,
		);
	}

	/**
	 * Add content to the document body
	 */
	public append(children: OfficeDocumentChild | OfficeDocumentChild[]) {
		this.children.push(...(Array.isArray(children) ? children : [children]));
	}

	/**
	 * Set the contents of the document
	 */
	public set(children: OfficeDocumentChild | OfficeDocumentChild[]) {
		this.children.splice(0, this.children.length);
		this.append(children);
	}

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
		const dom = await archive.readXml(location);

		const sections = evaluateXPathToNodes(
			`/*/${QNS.w}body/(${QNS.w}p/${QNS.w}pPr/${QNS.w}sectPr | ${QNS.w}sectPr)`,
			dom,
		);
		const children = sections.length
			? sections.map((node) => Section.fromNode(node))
			: createChildComponentsFromNodes<Table | Paragraph>(
					[Table.name, Paragraph.name],
					evaluateXPathToNodes(`/*/${QNS.w}body/*`, dom),
			  );
		return new OfficeDocument(location, relationships, children);
	}
}
