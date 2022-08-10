import { GenericRenderer } from 'https://deno.land/x/xml_renderer@5.0.5/mod.ts';

import type { Component } from './classes/Component.ts';
import { Docx } from './Docx.ts';
import { parse } from './utilities/dom.ts';
import { JSX } from './utilities/jsx.ts';

type RuleResult = Component | string | null | Array<RuleResult>;

function publicApiForBundle(docx: Docx) {
	return {
		document: docx.document,
		styles: docx.document.styles,
	};
}

/**
 * The top-level configuration API for creating a new transformation of your XML input to a valid
 * OOXML `.docx` file. Its properties and methods provide convenient access to registering transformation
 * rules ({@link Api.match}) or more fine-grained control of the contents of the DOCX.
 *
 * Uses {@link Docx} to describe the product DOCX file.
 */
export class Api<PropsGeneric extends { [key: string]: unknown }> {
	/**
	 * The JSX pragma.
	 */
	public readonly JSX = JSX;

	/**
	 * The JSX pragma.
	 *
	 * @deprecated If you can, use the instance JSX property.
	 */
	public static readonly JSX = JSX;

	/**
	 * A reference to the {@link Docx} instance representing the result DOCX file.
	 */
	public readonly docx: Docx;

	public constructor() {
		this.docx = Docx.fromNothing();
	}

	/**
	 * The XML renderer instance containing translation rules, going from your XML to this library's
	 * OOXML components.
	 */
	private readonly renderer = new GenericRenderer<
		RuleResult,
		ReturnType<typeof publicApiForBundle> & PropsGeneric
	>();

	/**
	 * Add an XML translation rule, applied to an element that matches the given XPath test.
	 *
	 * If an element matches multiple rules, the rule with the most specific XPath test wins.
	 */
	public match(xPathTest: string, transformer: Parameters<typeof this.renderer.add>[1]) {
		this.renderer.add(xPathTest, transformer);
		return this;
	}

	/**
	 * A short-cut to the relationship that represents visible document content.
	 */
	public get document() {
		return this.docx.document;
	}

	/**
	 * A short-cut to the relationship that represents visible document styles. Through this
	 * relationships new styles can be added.
	 */
	public get styles() {
		return this.docx.document.styles;
	}

	/**
	 * Set the XML-to-DOCX transformation in motion for the given XML string, and whichever added
	 * context you want to pass into the translation rule callbacks.
	 */
	public async transform(xml: string, props: PropsGeneric) {
		// Clone the DOCX styles (etc.) to a new instance that we can mess with
		// @TODO find a cheaper way to clone a Docx instance.
		const docx = await Docx.fromArchive(this.docx.toArchive());

		const ast = await this.renderer.render(parse(xml), {
			...publicApiForBundle(docx),
			...props,
		});
		const children = (Array.isArray(ast) ? ast : [ast]).filter(
			(child): child is Component => child !== null && typeof child !== 'string',
		);

		// There is no guarantee that the rendering rules produce schema-valid XML.
		// @TODO implement some kind of an errr-out mechanism

		docx.document.set(children);

		return docx;
	}
}
