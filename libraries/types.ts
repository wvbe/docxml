import { Component as XmlRendererComponent } from 'https://deno.land/x/xml_renderer@5.0.4/mod.ts';
import docx from 'https://esm.sh/docx@7.3.0';

import type { Application } from './classes/application.ts';
import type { Style } from './classes/style.ts';

/**
 * The options with which the application can be run from a configuration file.
 */
export type Options<PropsGeneric extends { [key: string]: unknown }> = {
	/**
	 * The location of the source XML file, if any.
	 *
	 * When omitted, the application will attempt to read content piped in via
	 * {@link Options.stdin}.
	 */
	source?: string | null;

	/**
	 * Alternatively to {@link Options.source} and piping {@link Options.stdin} you can feed an XML
	 * string directly into options.
	 */
	xml?: string;

	/**
	 * The location of the output DOCX file, if any.
	 *
	 * When omitted, the application will pipe a binary stream to {@link Options.stdout}.
	 */
	destination?: string | null;

	/**
	 * When set to `true`, the application will log additional information to help debug an export.
	 */
	debug?: boolean;

	/**
	 * The current working directory. Only used when pointing at files, eg when using
	 * {@link Options.source} or {@link Options.destination}.
	 *
	 * When omitted, the application will use `Deno.cwd()`.
	 */
	cwd?: string;

	/**
	 * The input stream. Only used when not using files.
	 *
	 * When omitted, the application will use `Deno.stdin`.
	 */
	stdin?: Deno.Reader & { rid: number };

	/**
	 * The output stream. Only used when not using files.
	 *
	 * When omitted, the application will use `Deno.stdout`.
	 */
	stdout?: Deno.Writer;

	props: PropsGeneric;
};

/**
 * Represents the overwrite properties of a default DOTX style.
 *
 * @deprecated This type may be renamed for clarity.
 */
export type DefaultStyle = keyof Exclude<docx.IStylesOptions['default'], undefined>;

/**
 * Represents the information found in a .dotx Word template file. Contains styles that may be used
 * in {@link AstComponent AstComponents} so that you can quickly conform to a visual style.
 */
export interface Template {
	init(): Promise<Partial<ConstructorParameters<typeof docx.Document>[0]>>;

	style(name: string): Style;

	overwrite(id: DefaultStyle, definition: docx.IBaseParagraphStyleOptions): this;

	define(definition: Omit<docx.IParagraphStyleOptions, 'id'>): Style;
	define(id: string, definition: Omit<docx.IParagraphStyleOptions, 'id'>): Style;
}

/**
 * A `AstNode` is a specification of how a DOCX element behaves. The script works by
 * collecting these nodes in a hierarchy, through a set of rules that may differ per schema, and
 * finally serializing that to a `.docx` file.
 */
export type AstNode<
	Label extends string = string,
	Props extends { [key: string]: unknown } = { [key: string]: unknown },
	DocxYield = unknown,
> = {
	component: AstComponent<AstNode<Label, Props, DocxYield>>;

	/**
	 * @todo description
	 */
	style: Style | null;

	/**
	 * The children of this DOCX element, which are themselves {@link AstNode AstNodes}.
	 */
	children: (string | AstNode)[];

	props: Props;
};

type AstNodeLabel<Node> = Node extends AstNode<infer Label, { [key: string]: unknown }>
	? Label
	: never;

/**
 * The props passed into the top-level component function
 */
export type AstComponentProps<Node> = Node extends AstNode<string, infer Props> ? Props : never;

export type DocxFactoryYield<Node> = Node extends AstNode<
	string,
	{ [key: string]: unknown },
	infer Yield
>
	? Yield
	: never;

type DocxFactory<NodeGeneric extends AstNode, PropsGeneric extends { [key: string]: unknown }> = (
	// The props passed to `toDocx` are the same as passed to the component itself, but the
	// children are of the correlating docx.* type (and not components themselves)
	props: Omit<AstComponentProps<NodeGeneric>, 'children'> & {
		children: AstComponentProps<NodeGeneric>['children'] extends
			| Array<string | AstNode<string, { [key: string]: unknown }, infer Y>>
			| undefined
			? Array<Y>
			: Array<unknown>;
	},
	application: Application<PropsGeneric>,
) => DocxFactoryYield<NodeGeneric> | Promise<DocxFactoryYield<NodeGeneric>>;

/**
 * A `AstComponent` is a function that receives props depending on the type of DOCX thing is being
 * rendered (documented in {@link https://www.npmjs.com/package/docx}), and returns an
 * {@link AstNode}.
 *
 * AstComponents can be used together with the {@link ../jsx.ts#JSX JSX} pragma for syntactic sugar.
 *
 * In the following example, `Document`, `Section`, `Paragraph` and `Text` are all AstComponents:
 *
 * ```ts
 * <Document>
 *   <Section>
 *     <Paragraph><Text>Hello.</Text></Paragraph>
 *   </Section>
 * </Document>
 * ```
 */
export interface AstComponent<
	NodeGeneric extends AstNode,
	PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
> {
	(props: AstComponentProps<NodeGeneric>): void | Promise<void>;
	type: AstNodeLabel<NodeGeneric>;
	children: string[];
	mixed?: boolean;
	toDocx: DocxFactory<NodeGeneric, PropsGeneric>;
}

/**
 * When creating an element rendering rule, an XPath test is matched to a RuleAstComponent. The rule
 * component is expected to return null or a AstComponent -- which represents a node in the DOCX
 * AST.
 *
 * In the following example, the arrow function declaration is a _rule_ component that returns the
 * `Text` _docx_ component:
 *
 * ```ts
 * app.match('self::bold', ({ traverse }) => (
 *   <Text bold>{traverse()}</Text>
 * ));
 * ```
 */
export type RuleAstComponent<PropsGeneric extends { [key: string]: unknown }> =
	XmlRendererComponent<RuleReturnType, RuleAdditionalProps<PropsGeneric>>;

export type RuleAdditionalProps<PropsGeneric extends { [key: string]: unknown }> = {
	/**
	 * The DOTX template that is associated with the renderer. Provides helper methods to access
	 * reuseable styles defined in the DOTX file.
	 */
	template: Template;
} & PropsGeneric;

type Util_SelfArrayPromiseOrPromisedArrayOfSelf<Self> =
	| Self
	| Promise<Self>
	| Util_SelfArrayPromiseOrPromisedArrayOfSelf<Self>[]
	| Promise<Util_SelfArrayPromiseOrPromisedArrayOfSelf<Self>[]>;

/**
 * All the things that can be returned by a {@link AstComponent} -- pretty much a {@link AstNode},
 * null, a promise thereof, or an array of any of the above.
 */
export type RuleReturnType = Util_SelfArrayPromiseOrPromisedArrayOfSelf<AstNode | null | string>;
