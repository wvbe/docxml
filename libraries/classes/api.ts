import docx from 'https://esm.sh/docx@7.3.0';
import { slimdom, sync } from 'https://esm.sh/slimdom-sax-parser@1.5.3';

import { Renderer } from '../classes/renderer.ts';
import writeDocxFile from '../component-utilities.ts';
import { convertToDocument } from '../jsonml-utilities.ts';
import { DocxNode, JsonmlWithStyles, RuleComponent, Style, Template } from '../types.ts';
import { EmptyTemplate } from './template.empty.ts';

/**
 * This class is the primary public API for the `fonto-to-docx` library. Use it to associate
 * {@link DocxComponent} and DOTX styles to element selectors, see also the {@link Api.add add()}
 * method. Finally, run `.writeXmlToDocx()` in order to apply those rules and generate
 * a `.docx` file from them.
 */
export class Api {
	renderer = new Renderer();

	private _template: Template = new EmptyTemplate();
	template(template: Template) {
		this._template = template;
	}

	/**
	 * Register a new element selector/template pair. Use this to map a new XML element to a
	 * different DOCX output. The first argument is an XPath test. The second argument is a
	 * renderer component (one that receives `node` and `traverse` props), and should return
	 * a DOCX component (one that receives options accepted by the `docx` library, and returning
	 * a DOCX AST.
	 */
	public add(selector: string, component: RuleComponent) {
		return this.renderer.add(selector, component);
	}

	/**
	 * Expost in case an outside user wants to have the AST first (and maybe inspect it) before
	 * rendering to a file.
	 *
	 * For typical use, use {@link API#writeXmlToDocx} instead.
	 */
	public async renderXmlStringToAst(xmlString: string) {
		const dom = sync(xmlString);
		const ast = await this.renderer.renderDocx(dom as unknown as Node, this._template);
		return ast;
	}

	/**
	 * Convert a string of XML to an XML DOM, apply all element selector/template pairs, and write
	 * the result to a .docx file on disk.
	 */
	public async writeXmlToDocx(xmlString: string, destination: string) {
		const ast = await this.renderXmlStringToAst(xmlString);
		if (!ast) {
			throw new Error('The rendered file is empty');
		}
		// @TODO its possible that the rendering rules output _multiple_ docx.Document nodes, or
		// none. Those edge cases are currently not handled, and "hidden" by coercing the `ast`
		// instance to `DocxNode`.
		return Api.writeAstToDocx(destination, ast as DocxNode<'Document', docx.Document>);
	}

	/**
	 * Convert a string of XML to an XML DOM, apply all element selector/template pairs, and write
	 * the result to a .html file on disk.
	 */
	public async writeXmlToHtml(xmlString: string, destination: string) {
		const ast = await this.renderXmlStringToAst(xmlString);
		if (!ast) {
			throw new Error('The rendered file is empty');
		}
		// @TODO its possible that the rendering rules output _multiple_ docx.Document nodes, or
		// none. Those edge cases are currently not handled, and "hidden" by coercing the `ast`
		// instance to `DocxNode`.
		return Api.writeAstToHtml(destination, ast as DocxNode<'Document', docx.Document>);
	}

	/**
	 * Create a human-readable string that represents the AST. Hopefully useful for debugging.
	 */
	public static stringifyAst(ast: DocxNode) {
		const BR = '\n';
		const TAB = '  ';
		let str = '';
		(function recurse(astNode: DocxNode, level: number) {
			const children = astNode.children.filter(Boolean);
			const nodeName = astNode.type + (astNode.style ? `#${astNode.style.name}` : '');
			if (!children.length) {
				str += (str ? BR : '') + TAB.repeat(level) + `<${nodeName} />`;
			} else {
				str += (str ? BR : '') + TAB.repeat(level) + `<${nodeName}>`;
				astNode.children.filter(Boolean).forEach((child) => recurse(child, level + 1));
				str += (str ? BR : '') + TAB.repeat(level) + `</${nodeName}>`;
			}
		})(ast, 0);
		return str;
	}

	/**
	 * Write an AST to a .docx file on your disk.
	 *
	 * For typical use, use {@link API#writeXmlToDocx} instead.
	 */
	public static async writeAstToDocx(
		destination: string,
		ast: DocxNode<'Document', docx.Document> | Promise<DocxNode<'Document', docx.Document>>,
	) {
		await writeDocxFile(destination, (await ast).docx);
	}

	/**
	 * Write an AST to a .docx file on your disk.
	 *
	 * For typical use, use {@link API#writeXmlToDocx} instead.
	 */
	public static async writeAstToHtml(
		destination: string,
		ast: DocxNode<'Document', docx.Document> | Promise<DocxNode<'Document', docx.Document>>,
	) {
		const dom = convertToDocument<JsonmlWithStyles>((await ast).jsonml, (_name, value) => {
			if (value && (value as Style).name) {
				return (value as Style).inlineCss;
			}
			return String(value);
		});
		await Deno.writeTextFile(destination, slimdom.serializeToWellFormedString(dom));
	}
}
