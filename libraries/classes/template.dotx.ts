import { JSZip, readZip } from 'https://deno.land/x/jszip@0.11.0/mod.ts';
import { evaluateXPathToStrings } from 'https://esm.sh/fontoxpath@3.26.0';
import { sync } from 'https://raw.githubusercontent.com/wvbe/slimdom-sax-parser/deno/src/index.ts';

import { Style, Template } from '../types.ts';

class DotxStyle implements Style {
	private template: DotxTemplate;
	public name: string;
	constructor(template: DotxTemplate, name: string) {
		this.template = template;
		this.name = name;
	}
	get inlineCss() {
		// @todo
		// Not implemented!
		return '';
	}
}

export class DotxTemplate implements Template {
	private location: string;
	constructor(location: string) {
		this.location = location;
	}
	private _zip: JSZip | null = null;
	private get zip() {
		if (!this._zip) {
			return readZip(this.location).then((contents) => {
				this._zip = contents;
				return this._zip;
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
	public availableStyleNames: string[] | null = null;

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
		return xml;
	}

	private styles = new Map<string, DotxStyle>();
	public style(name: string): Style {
		if (!this.availableStyleNames) {
			throw new Error(`DXE010:Cannot use styles without calling \`init\` first.`);
		}
		if (!this.availableStyleNames.includes(name)) {
			throw new Error(
				`DXE011:Style "${name}" is not available in this template. The only available style names are: ${this.availableStyleNames.join(
					', ',
				)}`,
			);
		}
		if (!this.styles.has(name)) {
			const style = new DotxStyle(this, name);
			this.styles.set(name, style);
			return style;
		}
		return this.styles.get(name) as DotxStyle;
	}
}
