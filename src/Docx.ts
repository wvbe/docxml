import { AnyComponent } from './classes/Component.ts';
import { ZipArchive } from './classes/ZipArchive.ts';
import { Image } from './components/Image.ts';
import { BundleFile } from './enums.ts';
import { ContentTypes } from './files/ContentTypes.ts';
import { OfficeDocument, OfficeDocumentChild } from './files/OfficeDocument.ts';
import { Relationships, RelationshipType } from './files/Relationships.ts';

/**
 * Represents the .docx file, which is essentially a ZIP archive with a bunch of XML files and
 * some naming conventions.
 *
 * An instance of this class can access other classes that represent the various XML files in a
 * DOCX archive, such as `ContentTypes.xml`, `word/document.xml`, and `_rels/.rels`.
 */
export class Docx {
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

	private constructor(
		contentTypes = new ContentTypes(BundleFile.contentTypes),
		relationships = new Relationships(BundleFile.relationships),
	) {
		this.contentTypes = contentTypes;
		this.relationships = relationships;

		Object.defineProperty(this, '_officeDocument', { enumerable: false });
	}

	// Also not enumerable
	private _officeDocument: OfficeDocument | null = null;

	/**
	 * A short-cut to the relationship that represents visible document content.
	 */
	public get document() {
		// @TODO Invalidate the cached _officeDocument whenever that relationship changes.
		if (!this._officeDocument) {
			this._officeDocument = this.relationships.ensureRelationship(
				RelationshipType.officeDocument,
				() => new OfficeDocument(BundleFile.mainDocument),
			);
		}
		return this._officeDocument;
	}

	/**
	 * Create a ZIP archive, which is the handler for `.docx` files as a ZIP archive.
	 */
	public toArchive(): ZipArchive {
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

			if (component instanceof Image) {
				component.ensureRelationship(relationships);
			}

			component.children.forEach(walk);
		});

		const archive = new ZipArchive();

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
	 * Instantiate this class by giving it a `.docx` file if it is already loaded as a {@link ZipArchive} instance.
	 */
	public static async fromArchive(archive: ZipArchive): Promise<Docx>;

	/**
	 * Instantiate this class by pointing at a `.docx` file location.
	 */
	public static async fromArchive(location: string): Promise<Docx>;

	/**
	 * Instantiate this class by referencing an existing `.docx` archive.
	 */
	public static async fromArchive(locationOrZipArchive: string | ZipArchive): Promise<Docx> {
		const archive =
			typeof locationOrZipArchive === 'string'
				? await ZipArchive.fromFile(locationOrZipArchive)
				: locationOrZipArchive;
		return new Docx(
			await ContentTypes.fromArchive(archive, BundleFile.contentTypes),
			await Relationships.fromArchive(archive, BundleFile.relationships),
		);
	}

	/**
	 * Create an empty DOCX, and populate it with the minimum viable contents to appease MS Word.
	 */
	public static fromNothing() {
		const bundle = new Docx();

		bundle.relationships.add(
			RelationshipType.officeDocument,
			new OfficeDocument(BundleFile.mainDocument),
		);

		return bundle;
	}

	/**
	 * Create a new DOCX with contents composed by this library's components. Needs a single JSX component
	 * as root, for example `<Document>`, `<Section>` or `<Paragragh>`.
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
}
