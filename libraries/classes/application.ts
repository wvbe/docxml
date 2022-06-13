import { copy, readerFromStreamReader } from 'https://deno.land/std@0.140.0/streams/conversion.ts';
import { resolve } from 'https://deno.land/std@0.141.0/path/mod.ts';
import docx from 'https://esm.sh/docx@7.3.0';
import { Node } from 'https://esm.sh/slimdom@3.1.0';
import {
	slimdom,
	sync,
} from 'https://raw.githubusercontent.com/wvbe/slimdom-sax-parser/deno/src/index.ts';

import { Renderer } from '../classes/renderer.ts';
import { DocumentNode } from '../components/documents.ts';
import { DocxNode, JsonmlWithStyles, Options, RuleComponent, Style, Template } from '../types.ts';
import { getOptionsFromArgv, getPipedStdin } from '../utilities/command-line.ts';
import { convertToDocument } from '../utilities/jsonml.ts';
import JSX from '../utilities/jsx.ts';
import { EmptyTemplate } from './template.empty.ts';

/**
 * This class is the primary public Application for this package. Use it to associate
 * {@link DocxComponent} and DOTX styles to element selectors, see also the {@link Application.add add()}
 * method. Finally, run `.write()` in order to apply those rules and generate
 * a `.docx` file from them.
 */
export class Application {
	//----
	//
	// Private instance members
	//
	//----

	private renderer = new Renderer();

	private _template: Template = new EmptyTemplate();

	private async executeOptions(options: Options) {
		const xml = options.source
			? await Deno.readTextFile(resolve(options.cwd || Deno.cwd(), options.source))
			: await getPipedStdin(options.stdin || Deno.stdin);
		if (!xml) {
			throw new Error(`The XML input cannot be empty.`);
		}

		const ast = (await this.renderer.renderDocx(sync(xml), this._template)) as DocumentNode | null;
		if (!ast) {
			throw new Error('The transformation resulted in an empty document.');
		}

		if (options.debug) {
			console.error(Application.stringifyAst(ast as DocumentNode));
		}

		const blob = await docx.Packer.toBlob(ast.docx);
		if (options.destination) {
			const bytes = new Uint8Array(await blob.arrayBuffer());
			await Deno.writeFile(resolve(options.cwd || Deno.cwd(), options.destination), bytes);
		} else {
			const reader = new ReadableStreamDefaultReader(blob.stream());
			await copy(readerFromStreamReader(reader), options.stdout || Deno.stdout);
		}
	}

	//----
	//
	// Public instance members
	//
	//----

	/**
	 * The recommended JSX pragma to use in any TSX file where
	 * {@link ../types.ts#DocxComponent DocxComponents} are used.
	 */
	public JSX = JSX;

	/**
	 * Register a new element selector/template pair. Use this to map a new XML element to a
	 * different DOCX output. The first argument is an XPath test. The second argument is a
	 * renderer component (one that receives `node` and `traverse` props), and should return
	 * a DOCX component (one that receives options accepted by the `docx` library, and returning
	 * a DOCX AST.
	 */
	public add(selector: string, component: RuleComponent) {
		this.renderer.add(selector, component);
		return this;
	}

	/**
	 * Register a DOTX template to reuse for its formatting styles. This interface will be made
	 * available to each rendering rule as the `template` prop. The {@link Template.style} method
	 * can be used to reference one of the styles in the template safely.
	 *
	 * If you use a {@link DotxTemplate}, be sure to send `await template.init()` to the `template`
	 * prop of the {@link Document} component.
	 */
	public template(template: Template) {
		this._template = template;
	}

	/**
	 * Run your configuration, using whatever options are passed to this method, or whatever options
	 * can be passed from command line arguments passed to this method.
	 */
	public async execute(options?: Options | string[]) {
		try {
			const timeStart = Date.now();
			await this.executeOptions(
				Array.isArray(options)
					? getOptionsFromArgv(Array.from(options))
					: options || getOptionsFromArgv(Array.from(Deno.args)),
			);
			console.error(`Succeeded in ${Date.now() - timeStart} milliseconds.`);
		} catch (error: unknown) {
			console.error('⚠️   The DOCX output failed because of an error:');
			console.error(`    ${(error as Error).message || error}`);
			Deno.exit(1);
		}
	}

	//----
	//
	// Public static members
	//
	//----

	/**
	 * Create a human-readable string that represents the AST. Hopefully useful for debugging.
	 *
	 * @deprecated It is recommended to use an instance of Application instead. This method may
	 *             be removed in the future.
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
	 * Write an AST to a .docx file on your disk. Convenient static method if you simply want to
	 * save some component composition to DOCX and nothing else.
	 *
	 * For typical use, use {@link Application#write} instead.
	 *
	 * @deprecated It is recommended to use an instance of Application instead. This method may
	 *             be removed in the future.
	 */
	public static async writeAstToDocx(
		destination: string,
		ast: DocumentNode | Promise<DocumentNode>,
	) {
		const blob = await docx.Packer.toBlob((await ast).docx);
		await Deno.writeFile(destination, new Uint8Array(await blob.arrayBuffer()));
	}

	/**
	 * @deprecated It is recommended to use an instance of Application instead. This method may
	 *             be removed in the future.
	 */
	public static JSX = JSX;

	/**
	 * Write an AST to a .docx file on your disk.
	 *
	 * @deprecated HTML exports do not work well. This method may be removed in the future.
	 */
	public static async writeAstToHtml(
		destination: string,
		ast: DocumentNode | Promise<DocumentNode>,
	) {
		const dom = convertToDocument<JsonmlWithStyles>((await ast).jsonml, (_name, value) => {
			if (value && (value as Style).name) {
				return (value as Style).inlineCss;
			}
			return String(value);
		});
		await Deno.writeTextFile(
			destination,
			slimdom.serializeToWellFormedString(dom as unknown as Node),
		);
	}
}
