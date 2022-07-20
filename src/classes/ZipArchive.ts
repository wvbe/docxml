import { JSZip, readZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts';

import { parse, serialize } from '../util/dom.ts';

export class ZipArchive {
	public readonly location?: string;
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

	public asUint8Array(): Promise<Uint8Array> {
		return this.zip.generateAsync({ type: 'uint8array' });
	}

	public async readXml(location: string) {
		return parse(await this.readText(location));
	}

	public writeXml(location: string, node: Node | Document) {
		const xml = serialize(node);
		this.zip.addFile(location, xml);
	}

	public static async fromFile(location: string) {
		return new ZipArchive(await readZip(location));
	}

	public async toFile(location: string) {
		await Deno.writeFile(location, await this.asUint8Array());
	}
}
