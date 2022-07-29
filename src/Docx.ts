import { ContentTypes } from './bundle/ContentTypes.ts';
import { OfficeDocument, OfficeDocumentChild } from './bundle/OfficeDocument.ts';
import { Relationships, RelationshipType } from './bundle/Relationships.ts';
import { AnyXmlComponent } from './classes/XmlComponent.ts';
import { ZipArchive } from './classes/ZipArchive.ts';
import { BundleFile } from './types.ts';

export type Options = {
	verbose?: boolean;
};

/**
 * Represents the .docx file, which is essentially a ZIP archive with a bunch of XML files and
 * some naming conventions.
 *
 * The files contained in a .docx archive are modelled as properties (recursive) using classes in
 * `src/bundle/`.
 */
export class Docx {
	public readonly contentTypes: ContentTypes;

	public readonly relationships: Relationships;

	private options: Options;

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
		const { verbose } = this.options;

		// Better late than never
		this.relationships
			.getRelated()
			.filter((related) => !(related instanceof Relationships))
			.forEach((related) => {
				// deno-lint-ignore no-explicit-any
				this.contentTypes.addOverride(related.location, (related.constructor as any).contentType);
			});

		const styles = this.document.styles;
		this.document.children.forEach(function walk(component: AnyXmlComponent | string) {
			if (typeof component === 'string') {
				return;
			}
			const styleName = component.props.style as string;
			if (styleName && !styles.hasStyle(styleName)) {
				if (verbose) {
					console.error(`⚠️ Referencing unknown style "${styleName}"`);
				}
				styles.add({
					id: styleName,
					type: 'paragraph',
					basedOn: 'Normal',
				});
			}
			component.children.forEach(walk);
		});

		const archive = new ZipArchive();
		this.contentTypes.toArchive(archive);
		this.relationships.toArchive(archive);
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
			console.error('Roots: ' + roots.map((r) => r.constructor.name).join(', '));
			throw new Error(
				`Found ${roots.length} root elements, but exactly 1 expected. This may be caused by invalid nesting that could not be repaired.`,
			);
		}
		const bundle = Docx.fromNothing();
		bundle.document.set(roots[0]);
		return bundle;
	}
}
