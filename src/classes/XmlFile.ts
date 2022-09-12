import { ContentType } from '../enums.ts';
import { parse } from '../utilities/dom.ts';
import { type BinaryFile } from './BinaryFile.ts';
import { type ZipArchive } from './ZipArchive.ts';

export class XmlFile {
	public static readonly contentType: ContentType = ContentType.xml;

	public readonly location: string;

	protected constructor(location: string) {
		this.location = location;
	}

	public get contentType(): ContentType {
		return (this.constructor as typeof XmlFile).contentType;
	}

	/**
	 * Create a (slimdom) Document DOM for this XML file. This is useful for serializing it to string
	 * and writing to a ZIP/DOCX archive later.
	 */
	protected toNode(): Document {
		throw new Error(`${this.constructor.name}#toNode() is not implemented`);
	}

	/**
	 * @deprecated FOR TEST PURPOSES ONLY
	 */
	public $$$toNode() {
		return this.toNode();
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): Array<XmlFile | BinaryFile> {
		return [this];
	}

	/**
	 * Let a file tell the system when it is effectively empty, so it can be omitted from the archive.
	 */
	public isEmpty() {
		return false;
	}

	/**
	 * Add all related files to the given archive.
	 */
	public toArchive(archive: ZipArchive): void {
		this.getRelated().forEach((related) => {
			if (related instanceof XmlFile) {
				archive.addXmlFile(related.location, related.toNode());
			} else {
				related.toArchive(archive);
			}
		});
	}

	/**
	 * Promise a new JS instance of this file based on the given archive.
	 */
	public static fromArchive(_archive: ZipArchive, location: string): Promise<XmlFile> {
		return Promise.resolve(new XmlFile(location));
	}
}

export class UnhandledXmlFile extends XmlFile {
	private _xml: string;

	protected constructor(location: string, xml: string) {
		super(location);
		this._xml = xml;
	}

	protected toNode(): Document {
		return parse(this._xml);
	}

	public static async fromArchive(archive: ZipArchive, location: string) {
		return new UnhandledXmlFile(location, await archive.readText(location));
	}
}
