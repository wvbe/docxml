import { JSZip, readZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts';
import { evaluateXPathToStrings } from 'https://esm.sh/fontoxpath@3.26.0';
import { sync } from 'https://raw.githubusercontent.com/wvbe/slimdom-sax-parser/deno/src/index.ts';

import type { Template } from '../types.ts';
import { Style } from './style.ts';
import { EmptyTemplate } from './template.empty.ts';

export class DotxTemplate extends EmptyTemplate implements Template {
	private location: string;

	constructor(location: string) {
		super();
		this.location = location;
	}

	private _zip: JSZip | null = null;
	private get zip() {
		if (!this._zip) {
			return readZip(this.location)
				.then((contents) => {
					this._zip = contents;
					return this._zip;
				})
				.catch((error) => {
					error.message = `DXE005: Could not read the DOTX template file due to error "${error.message}"`;
					throw error;
				});
		} else {
			return Promise.resolve(this._zip);
		}
	}

	private async file(location: string): Promise<string> {
		const zip = await this.zip;
		return zip.file(location).async('string');
	}

	// Only public for debug purposes;
	private availableStyleNames: string[] | null = null;

	/**
	 * Read a DOTX file, cache some stuff _and_ return the string XML that the docx lib expects
	 * as the "externalStyles" option.
	 */
	public async init() {
		const xml = await this.file('word/styles.xml');
		const dom = sync(xml);
		this.availableStyleNames = evaluateXPathToStrings(
			`
				/w:styles/w:style/@w:styleId,
				/w:styles/w:latentStyles/w:lsdException/@w:name
			`,
			dom,
		);
		return { externalStyles: xml, styles: this.customStyles };
	}

	private styles = new Map<string, Style>();
	public style(name: string): Style {
		if (!this.availableStyleNames) {
			throw new Error(`DXE010: Cannot use styles without calling \`init\` first.`);
		}
		if (
			!this.availableStyleNames.includes(name) &&
			!this.customStyles.paragraphStyles.some((style) => style.id === name)
		) {
			throw new Error(
				`DXE011: Style "${name}" is not available in this template. The only available style names are: ${[
					...this.availableStyleNames,
					...this.customStyles.paragraphStyles.map((style) => style.id),
				].join(', ')}`,
			);
		}
		const style = this.styles.get(name);
		if (!style) {
			const newStyle = new Style(name);
			this.styles.set(name, newStyle);
			return newStyle;
		}
		return style;
	}
}
