import { GenericRenderer } from 'https://deno.land/x/xml_renderer@5.0.4/mod.ts';

import type { XmlComponent } from './classes/XmlComponent.ts';
import { Docx, Options } from './Docx.ts';
import { parse } from './util/dom.ts';
import { JSX } from './util/jsx.ts';

type RuleResult = XmlComponent | string | null | Array<RuleResult>;

function publicApiForBundle(docx: Docx) {
	return {
		document: docx.document,
		styles: docx.document.styles,
	};
}

export class Api<PropsGeneric extends { [key: string]: unknown }> {
	public readonly JSX = JSX;
	public static readonly JSX = JSX;

	private readonly options: Options;
	public readonly docx: Docx;

	constructor(options: Options = {}) {
		this.options = options;
		this.docx = Docx.fromNothing(this.options);
	}

	private readonly renderer = new GenericRenderer<
		RuleResult,
		ReturnType<typeof publicApiForBundle> & PropsGeneric
	>();

	public match(xPathTest: string, transformer: Parameters<typeof this.renderer.add>[1]) {
		this.renderer.add(xPathTest, transformer);
		return this;
	}

	public get document() {
		return this.docx.document;
	}
	public get styles() {
		return this.docx.document.styles;
	}

	public async transform(xml: string, props: PropsGeneric) {
		// Clone the DOCX styles (etc.) to a new instance that we can mess with
		// @TODO find a cheaper way to clone a Docx instance.
		const docx = await Docx.fromArchive(this.docx.toArchive(), this.options);

		const ast = await this.renderer.render(parse(xml), {
			...publicApiForBundle(docx),
			...props,
		});
		const children = (Array.isArray(ast) ? ast : [ast]).filter(
			(child): child is XmlComponent => child !== null && typeof child !== 'string',
		);

		// There is no guarantee that the rendering rules produce schema-valid XML.
		// @TODO implement some kind of an errr-out mechanism

		docx.document.set(children);

		return docx;
	}
}
