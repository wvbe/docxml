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
 * in {@link DocxComponent DocxComponents} so that you can quickly conform to a visual style.
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
	component: DocxComponent<AstNode<Label, Props, DocxYield>>;

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

type NodeLabel<Node> = Node extends AstNode<infer Label, { [key: string]: unknown }>
	? Label
	: never;

type NodeYield<Node> = Node extends AstNode<string, { [key: string]: unknown }, infer Yield>
	? Yield
	: never;

/**
 * The props passed into the top-level component function
 */
type ComponentProps<Node> = Node extends AstNode<string, infer Props> ? Props : never;

type NodeToDocxChildren<Node> = ComponentProps<Node>['children'] extends
	| Array<string | AstNode<string, { [key: string]: unknown }, infer Y>>
	| undefined
	? Array<Y>
	: never;

/**
 * A `DocxComponent` is a function that receives props depending on the type of DOCX thing is being
 * rendered (documented in {@link https://www.npmjs.com/package/docx}), and returns a
 * {@link AstNode}.
 *
 * DocxComponents can be used together with the {@link ../jsx.ts#JSX JSX} pragma for syntactic sugar.
 *
 * In the following example, `Document`, `Section`, `Paragraph` and `Text` are all DocxComponents:
 *
 * ```ts
 * <Document>
 *   <Section>
 *     <Paragraph><Text>Hello.</Text></Paragraph>
 *   </Section>
 * </Document>
 * ```
 */
export interface DocxComponent<N extends AstNode> {
	(props: ComponentProps<N>): void | Promise<void>;
	type: NodeLabel<N>;
	children: string[];
	mixed?: boolean;
	toDocx(
		// The props passed to `toDocx` are the same as passed to the component itself, but the
		// children are of the correlating docx.* type (and not components themselves)
		props: Omit<ComponentProps<N>, 'children'> & {
			children: NodeToDocxChildren<N>;
		},
	): NodeYield<N> | Promise<NodeYield<N>>;
	toJsonml?(props: ComponentProps<N>): JsonmlWithStyles | Promise<JsonmlWithStyles>;
}

/**
 * When creating an element rendering rule, an XPath test is matched to a RuleComponent. The rule
 * component is expected to return null or a DocxComponent -- which represents a node in the DOCX
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
export type RuleComponent = (props: RuleProps<RuleReturnType>) => RuleReturnType;

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
 * All the things that can be returned by a {@link DocxComponent} -- pretty much a {@link AstNode},
 * null, a promise thereof, or an array of any of the above.
 */
export type RuleReturnType =
	| AstNode
	| null
	| Promise<AstNode>
	| Promise<null>
	| RuleReturnType[]
	| Promise<RuleReturnType[]>;

/**
 * Normal JSONML. Used to represent a HTML document. Attributes must be a string, or they must be
 * undefined (in which case they are not serialized)
 */
export type Jsonml<AttrsType> =
	| string
	| [string, ...Jsonml<AttrsType>[]]
	| [string, { [name: string]: AttrsType }, ...Jsonml<AttrsType>[]];

/**
 * Like normal {@link Jsonml}, but element `style` attributes are allowed to be an instance
 * of {@link Style}. The system will convert them to traditional HTML style attributes before
 * serialization.
 *
 * For example:
 *
 * ```ts
 * const jsonml: JsonmlWithStyles = [
 *   'p',
 *   { style: template.style('SpecialParagraph') },
 *   'Hello world!'
 * ];
 * ```
 */
export type JsonmlWithStyles = Jsonml<string | Style | undefined>;
