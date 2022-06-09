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
 * A `DocxNode` is a specification of how a DOCX element behaves. The script works by
 * collecting these nodes in a hierarchy, through a set of rules that may differ per schema, and
 * finally serializing that to a `.docx` file.
 */
export type DocxNode<Label extends string = string, DocxReturnType = unknown> = {
	/**
	 * An identifier of the type of node this is. Used for debugging purposes, eg. stringifying
	 * the AST using {@link Api.stringifyAst}, but mostly for guarding against invalid children
	 * (see also {@link assertChildrenAreOnlyOfType}).
	 */
	type: Label;

	/**
	 * @todo description
	 */
	style?: Style;

	/**
	 * The children of this DOCX element, which are themselves {@link DocxNode DocxNodes}.
	 */
	children: DocxNode[];

	/**
	 * The `docx` AST node that is ultimately serialized into a `*.docx` file. Use any of the
	 * classes provided by {@link https://www.npmjs.com/package/docx docx}, and please refer to its
	 * {@link https://docx.js.org documentation} for more info on accepted options etc.
	 */
	docx: DocxReturnType;

	/**
	 * A JSONML expression of the (HTML equivalent of) this Word node. Used to create an actual
	 * HTML page later and measure to determine page breaks etc.
	 *
	 * Not fully implemented yet.
	 */
	jsonml: JsonmlWithStyles;
};

/**
 * A `DocxComponent` is a function that receives props depending on the type of DOCX thing is being
 * rendered (documented in {@link https://www.npmjs.com/package/docx}), and returns a
 * {@link DocxNode}.
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
export type DocxComponent<Props, DocxNodeReturn extends DocxNode> = (
	props: Props,
) => DocxNodeReturn | Promise<DocxNodeReturn>;

/**
 * When creating an element rendering rule, an XPath test is matched to a RuleComponent. The rule
 * component is expected to return null or a DocxComponent -- which represents a node in the DOCX
 * AST.
 *
 * In the following example, the arrow function declaration is a _rule_ component that returns the
 * `Bold` _docx_ component:
 *
 * ```ts
 * API.add('self::bold', ({ traverse }) => (
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
	 * API.add('self::bold', ({ traverse }) => (
	 *   <Text bold>{traverse()}</Text>
	 * ));
	 * ```
	 *
	 * Or with an XPath query:
	 *
	 * ```ts
	 * API.add('self::chapter', ({ traverse }) => (
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
 * All the things that can be returned by a {@link DocxComponent} -- pretty much a {@link DocxNode},
 * null, a promise thereof, or an array of any of the above.
 */
export type RuleReturnType =
	| DocxNode
	| null
	| Promise<DocxNode>
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
