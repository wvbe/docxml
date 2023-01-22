import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { Paragraph } from '../components/Paragraph.ts';
import { Table } from '../components/Table.ts';
import { FileMime } from '../enums.ts';
import { createChildComponentsFromNodes } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../utilities/namespaces.ts';
import { evaluateXPathToNodes } from '../utilities/xquery.ts';

export type HeaderFooterChild = Paragraph | Table;

export type HeaderFooterRoot =
	| HeaderFooterChild
	| HeaderFooterChild[]
	| Promise<HeaderFooterChild[]>;

/**
 * Somewhat generic implementation of either the Header or Footer helper classes.
 */
class HeaderFooterAbstractionXml extends XmlFile {
	#nodeName: string;

	#root: HeaderFooterRoot | null = null;

	constructor(location: string, nodeName: string) {
		super(location);
		this.#nodeName = nodeName;
	}

	/**
	 * The components normalized from #root, which is potentially arrayed, promised, array promised etc.
	 */
	public get children(): Promise<HeaderFooterChild[]> {
		if (!this.#root) {
			return Promise.resolve([]);
		}
		return Promise.resolve(this.#root)
			.then((root) => (Array.isArray(root) ? Promise.all(root) : [root]))
			.then((roots) =>
				roots.reduce<Promise<HeaderFooterChild[]>>(async function flatten(
					flatPromise,
					childPromise,
				): Promise<HeaderFooterChild[]> {
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
				<w:${this.#nodeName} ${ALL_NAMESPACE_DECLARATIONS}>
					{$children}
				</w:${this.#nodeName}>
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
	public set(root: HeaderFooterRoot): void {
		this.#root = root;
	}
}

export class HeaderXml extends HeaderFooterAbstractionXml {
	public static contentType = FileMime.header;

	constructor(location: string) {
		super(location, 'hdr');
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string) {
		const dom = await archive.readXml(location);
		const inst = new this(location);
		inst.set(
			createChildComponentsFromNodes<Table | Paragraph>(
				[Table.name, Paragraph.name],
				evaluateXPathToNodes(`/*/*`, dom),
			),
		);
		return inst;
	}
}

export class FooterXml extends HeaderFooterAbstractionXml {
	public static contentType = FileMime.footer;

	constructor(location: string) {
		super(location, 'ftr');
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string) {
		const dom = await archive.readXml(location);
		const inst = new this(location);
		inst.set(
			createChildComponentsFromNodes<Table | Paragraph>(
				[Table.name, Paragraph.name],
				evaluateXPathToNodes(`/*/*`, dom),
			),
		);
		return inst;
	}

	/**
	 * Create a new DOCX with contents composed by this library's components. Needs a single JSX component
	 * as root, for example `<Section>` or `<Paragragh>`.
	 */
	public static fromJsx(location: string, roots: HeaderFooterRoot) {
		const inst = new this(location);
		inst.set(roots);
		return inst;
	}
}
