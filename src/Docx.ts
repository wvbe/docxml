import { AnyComponent } from './classes/Component.ts';
import { ZipArchive } from './classes/ZipArchive.ts';
import { Image } from './components/Image.ts';
import { BundleFile } from './enums.ts';
import { ContentTypes } from './files/ContentTypes.ts';
import { OfficeDocument, OfficeDocumentChild } from './files/OfficeDocument.ts';
import { Relationships, RelationshipType } from './files/Relationships.ts';

export type Options = {
	[key: string]: never;
};

/**
 * Represents the .docx file, which is essentially a ZIP archive with a bunch of XML files and
 * some naming conventions.
 *
 * The files contained in a .docx archive are modelled as properties (recursive) using classes in
 * `src/files/`.
 */
export class Docx {
	public readonly contentTypes: ContentTypes;

	public readonly relationships: Relationships;

	private readonly options: Options;

	private constructor(
		options: Options,
		contentTypes = new ContentTypes(BundleFile.contentTypes),
		relationships = new Relationships(BundleFile.relationships),
	) {
		this.options = options;
		this.contentTypes = contentTypes;
		this.relationships = relationships;

		Object.defineProperty(this, '_officeDocument', { enumerable: false });
	}

	// Also not enumerable
	private _officeDocument: OfficeDocument | null = null;
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
	 * Instantiate this class by looking at the DOCX archive for it.
	 */
	public static async fromArchive(archive: ZipArchive, options?: Options): Promise<Docx>;
	public static async fromArchive(location: string, options?: Options): Promise<Docx>;
	public static async fromArchive(
		locationOrZipArchive: string | ZipArchive,
		options: Options = {},
	): Promise<Docx> {
		const archive =
			typeof locationOrZipArchive === 'string'
				? await ZipArchive.fromFile(locationOrZipArchive)
				: locationOrZipArchive;
		return new Docx(
			options,
			await ContentTypes.fromArchive(archive, BundleFile.contentTypes),
			await Relationships.fromArchive(archive, BundleFile.relationships),
		);
	}

	/**
	 * Create an empty bundle, and populate it with the minimum viable contents
	 */
	public static fromNothing(options: Options = {}) {
		const bundle = new Docx(options);

		bundle.relationships.add(
			RelationshipType.officeDocument,
			new OfficeDocument(BundleFile.mainDocument),
		);

		return bundle;
	}

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
