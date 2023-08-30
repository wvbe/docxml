import * as path from 'https://deno.land/std@0.187.0/path/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { type AnyComponent } from '../classes/Component.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { Paragraph } from '../components/Paragraph.ts';
import { Table } from '../components/Table.ts';
import { WatermarkText } from '../components/WatermarkText.ts';
import { FileMime } from '../enums.ts';
import { createChildComponentsFromNodes } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { evaluateXPathToNodes } from '../utilities/xquery.ts';
import { type File, RelationshipsXml } from './RelationshipsXml.ts';

export type HeaderFooterChild = Paragraph | Table;

export type HeaderFooterRoot<Child = HeaderFooterChild> = Child | Child[] | Promise<Child[]>;

/**
 * Somewhat generic implementation of either the Header or Footer helper classes.
 */
class HeaderFooterAbstractionXml<Child extends AnyComponent> extends XmlFile {
	#nodeName: string;

	#root: HeaderFooterRoot<Child> | null = null;

	public readonly relationships: RelationshipsXml | null;

	constructor(location: string, nodeName: string, relationships: RelationshipsXml | null = null) {
		super(location);
		this.#nodeName = nodeName;
		this.relationships = relationships;
	}

	/**
	 * The components normalized from #root, which is potentially arrayed, promised, array promised etc.
	 */
	public get children(): Promise<Child[]> {
		if (!this.#root) {
			return Promise.resolve([]);
		}
		return Promise.resolve(this.#root)
			.then((root) => (Array.isArray(root) ? Promise.all(root) : [root]))
			.then((roots) =>
				roots.reduce<Promise<Child[]>>(async function flatten(
					flatPromise,
					childPromise,
				): Promise<Child[]> {
					const child = await childPromise;
					const flat = await flatPromise;
					return Array.isArray(child)
						? [...flat, ...(await child.reduce(flatten, Promise.resolve([])))]
						: [...flat, child];
				},
				Promise.resolve([])),
			);
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 */
	public getRelated(): File[] {
		if (!this.relationships) {
			return [this];
		}
		return [this, ...this.relationships.getRelated()];
	}

	protected async toNode(): Promise<Document> {
		const children = await this.children;
		return create(
			`
				<w:${this.#nodeName} ${ALL_NAMESPACE_DECLARATIONS}>
					{$children}
				</w:${this.#nodeName}>
			`,
			{
				children: await Promise.all(
					children.map((child) => child.toNode([this as unknown as HeaderXml | FooterXml])),
				),
			},
			true,
		);
	}

	/**
	 * Set the contents of the document
	 */
	public set(root: HeaderFooterRoot<Child>): void {
		this.#root = root;
	}
}

export class HeaderXml extends HeaderFooterAbstractionXml<HeaderFooterChild | WatermarkText> {
	public static contentType = FileMime.header;

	constructor(location: string, relationships: RelationshipsXml | null) {
		super(location, 'hdr', relationships);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string) {
		const dom = await archive.readXml(location);
		const relsLocation = `${path.dirname(location)}/_rels/${path.basename(location)}.rels`;
		const relationships = archive.hasFile(relsLocation)
			? await RelationshipsXml.fromArchive(archive, relsLocation)
			: null;
		const inst = new this(location, relationships);
		inst.set(
			createChildComponentsFromNodes<Table | Paragraph>(
				[Table.name, Paragraph.name],
				evaluateXPathToNodes(`/*/*`, dom),
				{
					archive,
					relationships: inst.relationships,
				},
			),
		);
		return inst;
	}

	/**
	 * Create a new DOCX with contents composed by this library's components. Needs a single JSX component
	 * as root, for example `<Section>` or `<Paragragh>`.
	 */
	public static fromJsx(
		location: string,
		roots: HeaderFooterRoot<HeaderFooterChild | WatermarkText>,
	) {
		const inst = new this(location, null);
		inst.set(roots);
		return inst;
	}
}

export class FooterXml extends HeaderFooterAbstractionXml<HeaderFooterChild> {
	public static contentType = FileMime.footer;

	constructor(location: string, relationships: RelationshipsXml | null) {
		super(location, 'ftr', relationships);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string) {
		const dom = await archive.readXml(location);
		const relsLocation = `${path.dirname(location)}/_rels/${path.basename(location)}.rels`;
		const relationships = archive.hasFile(relsLocation)
			? await RelationshipsXml.fromArchive(archive, relsLocation)
			: null;
		const inst = new this(location, relationships);
		inst.set(
			createChildComponentsFromNodes<Table | Paragraph>(
				[Table.name, Paragraph.name],
				evaluateXPathToNodes(`/*/*`, dom),
				{
					archive,
					relationships: inst.relationships,
				},
			),
		);
		return inst;
	}

	/**
	 * Create a new DOCX with contents composed by this library's components. Needs a single JSX component
	 * as root, for example `<Section>` or `<Paragragh>`.
	 */
	public static fromJsx(location: string, roots: HeaderFooterRoot) {
		const inst = new this(location, null);
		inst.set(roots);
		return inst;
	}
}
