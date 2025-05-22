import JSZip from 'jszip';
import { normalize } from 'std/path';

import { parse, serialize } from '../utilities/dom.ts';

export class Archive {
	readonly location?: string;
	readonly #files: Record<string, Uint8Array> = {};
	readonly #promises: { location: string; promise: Promise<Uint8Array> }[] =
		[];

	constructor(files?: Record<string, Uint8Array>) {
		if (files) {
			for (const [k, v] of Object.entries(files)) {
				this.#files[k] = v;
			}
		}
	}

	get $$$fileNames(): Record<string, Uint8Array> {
		return this.#files;
	}

	hasFile(location: string): boolean {
		const normalizedLocation = normalize(location);
		return normalizedLocation in this.#files;
	}

	readText(location: string): Promise<string> {
		const normalizedLocation = normalize(location);
		const data = this.#files[normalizedLocation];
		if (!data) {
			throw new Error(`File not found: ${normalizedLocation}`);
		}
		return Promise.resolve(new TextDecoder().decode(data));
	}

	async readXml(location: string): Promise<Document> {
		const normalizedLocation = normalize(location);
		return parse(await this.readText(normalizedLocation));
	}

	readBinary(location: string): Promise<Uint8Array> {
		const normalizedLocation = normalize(location);
		const data = this.#files[normalizedLocation];
		if (!data) {
			throw new Error(`File not found: ${normalizedLocation}`);
		}
		return Promise.resolve(data);
	}

	addTextFile(location: string, contents: string): this {
		const normalizedLocation = normalize(location);
		this.#files[normalizedLocation] = new TextEncoder().encode(contents);
		return this;
	}

	addXmlFile(location: string, node: Node | Document): this {
		return this.addTextFile(
			location,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${serialize(
				node
			)}`
		);
	}

	addJsonFile(location: string, js: unknown): this {
		return this.addTextFile(location, JSON.stringify(js, null, '\t'));
	}

	addBinaryFile(location: string, promised: Promise<Uint8Array>): this {
		this.#promises.push({
			location: normalize(location),
			promise: promised,
		});
		return this;
	}

	async asUint8Array(): Promise<Uint8Array> {
		for await (const { location, promise } of this.#promises) {
			this.#files[location] = await promise;
		}

		const zip = new JSZip();
		for (const [name, data] of Object.entries(this.#files)) {
			zip.file(name, data);
		}
		return zip.generateAsync({ type: 'uint8array' });
	}

	static async fromUInt8Array(data: Uint8Array): Promise<Archive> {
		const zip = await JSZip.loadAsync(data);
		const files: Record<string, Uint8Array> = {};
		const promises: Promise<void>[] = [];

		zip.forEach((path, file) => {
			if (!file.dir) {
				const normalizedPath = normalize(path);
				const p = file.async('uint8array').then((contents) => {
					files[normalizedPath] = contents;
				});
				promises.push(p);
			}
		});

		await Promise.all(promises);
		return new Archive(files);
	}

	static async fromFile(location: string): Promise<Archive> {
		const normalizedLocation = normalize(location);
		const data = await Deno.readFile(normalizedLocation);
		return Archive.fromUInt8Array(data);
	}

	async toFile(location: string): Promise<void> {
		const normalizedLocation = normalize(location);
		await Deno.writeFile(normalizedLocation, await this.asUint8Array());
	}
}
