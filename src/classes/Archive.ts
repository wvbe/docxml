import { JSZip, readZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts';

import { parse, serialize } from '../utilities/dom.ts';

export class Archive {
	public readonly location?: string;

	/**
	 * @deprecated Try not to use this directly.
	 */
	public readonly zip: JSZip;

	constructor(zip?: JSZip) {
		this.zip = zip || new JSZip();
		Object.defineProperty(this, 'zip', {
			enumerable: false,
		});
	}

	public readText(location: string): Promise<string> {
		if (location.startsWith('/') || location.startsWith('./')) {
			location = location.substring(location.indexOf('/') + 1);
		}
		try {
			return this.zip.file(location).async('string');
		} catch (error: unknown) {
			throw new Error(
				`Could not read "${location}" from archive: ${
					(error as Error).message
				}. The only files in this archive are: ${Object.keys(this.zip.files()).join(', ')}`,
			);
		}
	}

	public async asUint8Array(): Promise<Uint8Array> {
		for await (const { location, promise } of this._promises) {
			this.zip.addFile(location, await promise);
		}
		return this.zip.generateAsync({ type: 'uint8array' });
	}

	public async readXml(location: string): Promise<Document> {
		return parse(await this.readText(location));
	}

	public readBinary(location: string): Promise<Uint8Array> {
		return this.zip.file(location).async('uint8array');
	}

	/**
	 * Create a new XML file in the DOCX archive.
	 */
	public addXmlFile(location: string, node: Node | Document): this {
		return this.addTextFile(location, serialize(node));
	}

	/**
	 * Create a new JSON file in the DOCX archive.
	 */
	// deno-lint-ignore no-explicit-any
	public addJsonFile(location: string, js: any): this {
		return this.addTextFile(location, JSON.stringify(js, null, '\t'));
	}

	/**
	 * Create a new text file in the DOCX archive.
	 */
	public addTextFile(location: string, contents: string): this {
		this.zip.addFile(location, contents);
		return this;
	}
	private readonly _promises: { location: string; promise: Promise<Uint8Array> }[] = [];

	/**
	 * Create a new text file in the DOCX archive.
	 *
	 * In order to keep this method (and methods that use it, eg. Docx#toArchive) synchronous,
	 * we're only writing a promise to memory for now and leave the asynchronous operations for
	 * output time (see also Archive#toUint8Array).
	 */
	public addBinaryFile(location: string, promised: Promise<Uint8Array>): this {
		this._promises.push({ location, promise: promised });
		return this;
	}

	public static async fromFile(location: string): Promise<Archive> {
		return new Archive(await readZip(location));
	}

	public async toFile(location: string): Promise<void> {
		await Deno.writeFile(location, await this.asUint8Array());
	}
}
