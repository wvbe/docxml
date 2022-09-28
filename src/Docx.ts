import { GenericRenderer } from 'https://deno.land/x/xml_renderer@5.0.5/mod.ts';

import { Archive } from './classes/Archive.ts';
import { type AnyComponent, type Component } from './classes/Component.ts';
import { BundleFile } from './enums.ts';
import { ContentTypes } from './files/ContentTypes.ts';
import { type OfficeDocumentChild, OfficeDocument } from './files/OfficeDocument.ts';
import { Relationships, RelationshipType } from './files/Relationships.ts';
import { parse } from './utilities/dom.ts';
import { jsx } from './utilities/jsx.ts';

type RuleResult = Component | string | null | Array<RuleResult>;

/**
 * Represents the DOCX file as a whole, and collates other responsibilities together. Provides
 * access to DOCX content types ({@link ContentTypes}), relationships ({@link Relationships}),
 * the document itself ({@link OfficeDocument}).
 *
 * An instance of this class can access other classes that represent the various XML files in a
 * DOCX archive, such as `ContentTypes.xml`, `word/document.xml`, and `_rels/.rels`.
 */
export class Docx<PropsGeneric extends { [key: string]: unknown } = { [key: string]: never }> {
	/**
	 * The JSX pragma.
	 */
	public readonly jsx = jsx;

	/**
	 * The JSX pragma.
	 *
	 * @deprecated This static property may be removed in the future since it does not have the context of
	 * a DOCX. If you can, use the instance JSX property. If you cannot, submit an issue.
	 */
	public static readonly jsx = jsx;

	/**
	 * The utility function dealing with the XML for recording content types. Every DOCX file has
	 * exactly one of these.
	 */
	public readonly contentTypes: ContentTypes;

	/**
	 * The utility function dealing with the top-level XML file for recording relationships. Other
	 * relationships may have their own relationship XMLs.
	 */
	public readonly relationships: Relationships;

	protected constructor(
		contentTypes = new ContentTypes(BundleFile.contentTypes),
		relationships = new Relationships(BundleFile.relationships),
		rules: GenericRenderer<RuleResult, { document: OfficeDocument } & PropsGeneric> | null = null,
	) {
		this.contentTypes = contentTypes;
		this.relationships = relationships;

		if (rules) {
			this.#renderer.merge(rules);
		}

		if (!this.relationships.hasType(RelationshipType.officeDocument)) {
			this.relationships.add(
				RelationshipType.officeDocument,
				new OfficeDocument(BundleFile.mainDocument),
			);
		}
	}

	// Also not enumerable
	#officeDocument: OfficeDocument | null = null;

	/**
	 * A short-cut to the relationship that represents visible document content.
	 */
	public get document() {
		// @TODO Invalidate the cached _officeDocument whenever that relationship changes.
		if (!this.#officeDocument) {
			this.#officeDocument = this.relationships.ensureRelationship(
				RelationshipType.officeDocument,
				() => new OfficeDocument(BundleFile.mainDocument),
			);
		}
		return this.#officeDocument;
	}

	/**
	 * Create a ZIP archive, which is the handler for `.docx` files as a ZIP archive.
	 */
	public toArchive(): Archive {
		const styles = this.document.styles;
		const relationships = this.document.relationships;
		this.document.children.forEach(function walk(component: AnyComponent | string) {
			if (typeof component === 'string') {
				return;
			}

			const styleName = component.props.style as string;
			if (styleName) {
				styles.ensureStyle(styleName);
			}

			component.ensureRelationship(relationships);

			component.children.forEach(walk);
		});

		const archive = new Archive();

		this.relationships.toArchive(archive);

		// New relationships may be created as they are necessary for serializing content, eg. for
		// images.
		this.relationships
			.getRelated()
			.filter((related) => !(related instanceof Relationships))
			.forEach((related) => {
				this.contentTypes.addOverride(related.location, related.contentType);
			});

		this.contentTypes.toArchive(archive);
		return archive;
	}

	/**
	 * Instantiate this class by giving it a `.docx` file if it is already loaded as a {@link Archive} instance.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	>(archive: Archive): Promise<Docx<PropsGeneric>>;

	/**
	 * Instantiate this class by pointing at a `.docx` file location.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	>(location: string): Promise<Docx<PropsGeneric>>;

	/**
	 * Instantiate this class by referencing an existing `.docx` archive.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	>(locationOrZipArchive: string | Archive): Promise<Docx<PropsGeneric>> {
		const archive =
			typeof locationOrZipArchive === 'string'
				? await Archive.fromFile(locationOrZipArchive)
				: locationOrZipArchive;
		return new Docx<PropsGeneric>(
			await ContentTypes.fromArchive(archive, BundleFile.contentTypes),
			await Relationships.fromArchive(archive, BundleFile.relationships),
		);
	}

	/**
	 * Create an empty DOCX, and populate it with the minimum viable contents to appease MS Word.
	 */
	public static fromNothing<
		PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	>() {
		return new Docx<PropsGeneric>();
	}

	/**
	 * Create a new DOCX with contents composed by this library's components. Needs a single JSX component
	 * as root, for example `<Section>` or `<Paragragh>`.
	 */
	public static fromJsx(roots: OfficeDocumentChild[]) {
		if (roots.length !== 1) {
			// console.error('Roots: ' + roots.map((r) => r.constructor.name).join(', '));
			throw new Error(
				`Found ${roots.length} root elements, but exactly 1 expected. This may be caused by invalid nesting that could not be repaired.`,
			);
		}
		const bundle = Docx.fromNothing();
		bundle.document.set(roots[0]);
		return bundle;
	}

	/**
	 * The XML renderer instance containing translation rules, going from your XML to this library's
	 * OOXML components.
	 */
	readonly #renderer = new GenericRenderer<
		RuleResult,
		{ document: OfficeDocument } & PropsGeneric
	>();

	/**
	 * Add an XML translation rule, applied to an element that matches the given XPath test.
	 *
	 * If an element matches multiple rules, the rule with the most specific XPath test wins.
	 */
	public withXmlRule(
		xPathTest: string,
		transformer: Parameters<
			GenericRenderer<RuleResult, { document: OfficeDocument } & PropsGeneric>['add']
		>[1],
	) {
		this.#renderer.add(xPathTest, transformer);
		return this;
	}

	public forXml(xml: string, props: PropsGeneric) {
		return this.forDom(parse(xml), props);
	}

	public forDom(dom: Document, props: PropsGeneric) {
		if (!this.#renderer.length) {
			throw new Error(
				'No XML transformation rules were configured, creating a DOCX from XML is therefore not possible.',
			);
		}

		const ast = this.#renderer.render(dom, {
			document: this.document,
			...props,
		});
		const children = (Array.isArray(ast) ? ast : [ast]).reduce<Component[]>(function flatten(
			flat,
			child,
		): Component[] {
			if (child === null || typeof child === 'string') {
				return flat;
			}
			if (Array.isArray(child)) {
				return [...flat, ...child.reduce(flatten, [])];
			}
			flat.push(child);
			return flat;
		},
		[]);

		// There is no guarantee that the rendering rules produce schema-valid XML.
		// @TODO implement some kind of an errr-out mechanism

		// @TODO validate that the children are correct?
		this.document.set(children as OfficeDocumentChild[]);

		return this;
	}

	/**
	 * Clone a new instance of {@link Docx} including all existing relationships, media, and XML transformation rules.
	 */
	public async clone(): Promise<Docx<PropsGeneric>> {
		// Clone the DOCX styles (etc.) to a new instance that we can mess with
		// @TODO find a cheaper way to clone a Docx instance.
		const docx = await Docx.fromArchive<PropsGeneric>(this.toArchive());

		// Clone rendering rules
		docx.#renderer.merge(this.#renderer);

		return docx;
	}
}
