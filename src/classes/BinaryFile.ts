import { ContentType } from '../enums.ts';
import { File } from '../files/Relationships.ts';
import { Archive } from './Archive.ts';

type BinaryFileReader = () => Promise<Uint8Array>;

/**
 * A utility class that represents a binary file inside the DOCX archive -- currently used for
 * images.
 */
export class BinaryFile {
	public readonly location: string;

	private readonly _reader: BinaryFileReader;

	protected constructor(location: string, reader: BinaryFileReader) {
		this.location = location;
		this._reader = reader;
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): File[] {
		return [this];
	}

	public get contentType(): ContentType {
		return ContentType.jpeg;
	}

	/**
	 * Let a file tell the system when it is effectively empty, so it can be omitted from the archive.
	 *
	 * @deprecated Remove?
	 */
	public isEmpty() {
		return false;
	}

	public static fromArchive(archive: Archive, location: string): BinaryFile {
		return new BinaryFile(location, () => archive.readBinary(location));
	}

	public static fromDisk(diskLocation: string, location: string): BinaryFile {
		return new BinaryFile(location, () => Deno.readFile(diskLocation));
	}

	public static fromData(data: Uint8Array | Promise<Uint8Array>, location: string): BinaryFile {
		return new BinaryFile(location, () => Promise.resolve(data));
	}

	public toUint8Array(): Promise<Uint8Array> {
		return this._reader();
	}

	/**
	 * Add all related files to the given archive.
	 */
	public toArchive(archive: Archive): void {
		archive.addBinaryFile(this.location, this.toUint8Array());
	}
}
