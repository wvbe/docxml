import { Node } from 'https://esm.sh/slimdom@3.1.0';

/**
 * The options with which the application can be run from a configuration file.
 */
export type Options = {
	/**
	 * The location of the source XML file, if any.
	 *
	 * When omitted, the application will attempt to read content piped in via
	 * {@link Options.stdin}.
	 */
	source?: string | null;
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
};

/**
 * Represents the information found in a .dotx Word template file. Contains styles that may be used
 * in {@link AstComponent AstComponents} so that you can quickly conform to a visual style.
 */
export interface Template {
	init(): Promise<string | undefined>;
	style(name: string): Style;
}

export interface Style {
	name: string;
	inlineCss: string;
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

type DocxFactory<N extends AstNode> = (
	// The props passed to `toDocx` are the same as passed to the component itself, but the
	// children are of the correlating docx.* type (and not components themselves)
	props: Omit<AstComponentProps<N>, 'children'> & {
		children: AstComponentProps<N>['children'] extends
			| Array<string | AstNode<string, { [key: string]: unknown }, infer Y>>
			| undefined
			? Array<Y>
			: Array<unknown>;
	},
) => DocxFactoryYield<N> | Promise<DocxFactoryYield<N>>;

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
export interface AstComponent<N extends AstNode> {
	(props: AstComponentProps<N>): void | Promise<void>;
	type: AstNodeLabel<N>;
	children: string[];
	mixed?: boolean;
	toDocx: DocxFactory<N>;
}

/**
 * When creating an element rendering rule, an XPath test is matched to a RuleAstComponent. The rule
 * component is expected to return null or a AstComponent -- which represents a node in the DOCX
 * AST.
 *
 * In the following example, the arrow function declaration is a _rule_ component that returns the
 * `Bold` _docx_ component:
 *
 * ```ts
 * app.add('self::bold', ({ traverse }) => (
 *   <Text bold>{traverse()}</Text>
 * ));
 * ```
 */
export type RuleAstComponent = (props: RuleProps<RuleReturnType>) => RuleReturnType;

/**
 * The props/parameters passed into a rule component by the renderer.
 */
export type RuleProps<Output = RuleReturnType> = {
	/**
	 * The XML node that is being rendered with this rule. Can be any type of node, and it matches
	 * the XPath test with which this rule is associated.
	 *
	 * Having the node available is useful in case you want to use other fontoxpath functions to
	 * query it further.
	 */
	node: Node;

	/**
	 * The DOTX template that is associated with the renderer. Provides helper methods to access
	 * reuseable styles defined in the DOTX file.
	 */
	template: Template;

	/**
	 * A function to kick off the rendering of arbitrary (child? sibling? who cares) XML nodes.
	 * Accepts an XPath query, or defaults to "all child nodes". Intended to be easily usable within
	 * a JSX template.
	 *
	 * The context node for any query ran through `traverse()` is the same as the
	 * {@link RuleProps.node node} prop.
	 *
	 * For example:
	 *
	 * ```ts
	 * app.add('self::bold', ({ traverse }) => (
	 *   <Text bold>{traverse()}</Text>
	 * ));
	 * ```
	 *
	 * Or with an XPath query:
	 *
	 * ```ts
	 * app.add('self::chapter', ({ traverse }) => (
	 *   <Section>
	 *     <Header>{traverse('./p[1]')}</Header>
	 *     {traverse('./node()[not(./p[1])]')}
	 *   </Section>
	 * ));
	 * ```
	 */
	traverse: (query?: string) => Promise<Output[]>;
};

/**
 * All the things that can be returned by a {@link AstComponent} -- pretty much a {@link AstNode},
 * null, a promise thereof, or an array of any of the above.
 */
type SelfArrayPromiseOrPromisedArrayOfSelf<Self> =
	| Self
	| Promise<Self>
	| SelfArrayPromiseOrPromisedArrayOfSelf<Self>[]
	| Promise<SelfArrayPromiseOrPromisedArrayOfSelf<Self>[]>;
	
export type RuleReturnType = SelfArrayPromiseOrPromisedArrayOfSelf<AstNode | null | string>;
