/**
 * A component-like approach to DOCX body content, such as paragraphs, lists, list items, tables,
 * etc.
 */
export type AnyXmlComponent = XmlComponent<{ [key: string]: unknown }, AnyXmlComponent | string>;

/**
 * Utility type to retrieve the prop types of an XmlComponent
 */
export type XmlComponentProps<ComponentGeneric extends XmlComponent | unknown> =
	// deno-lint-ignore no-explicit-any
	ComponentGeneric extends XmlComponent<infer P, any> ? P : { [key: string]: never };

/**
 * Utility type to retrieve the children types of an XmlComponent
 */
export type XmlComponentChild<ComponentGeneric extends XmlComponent | unknown> =
	// deno-lint-ignore no-explicit-any
	ComponentGeneric extends XmlComponent<any, infer C> ? C : never;

/**
 * The interface to which a class definition of an XML component must adhere -- ie.
 * it must have a `children` and `mixed` static property.
 */
export interface XmlComponentClassDefinition<
	C extends AnyXmlComponent | unknown = AnyXmlComponent,
> {
	new (props: XmlComponentProps<C>, ...children: XmlComponentChild<C>[]): C;
	children: C extends AnyXmlComponent
		? Array<XmlComponentClassDefinition<XmlComponentChild<C>>>
		: unknown[];
	mixed: boolean;
}

export class XmlComponent<
	PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	ChildGeneric extends AnyXmlComponent | string = never,
> {
	/**
	 * Informs the JSX pragma which child components are allowed in this component.
	 * The JSX pragma can use this to attempt repairs at invalidly nested children.
	 */
	public static children: XmlComponentClassDefinition<unknown>[] = [];

	/**
	 * Informs the JSX pragma on wether or not this component can contain text (string)
	 * children. The JSX pragma can use this to attempt repairs at invalidly nested children.
	 */
	public static mixed = false;

	/**
	 * The props given to this component instance.
	 */
	public readonly props: PropsGeneric;

	/**
	 * The children given to this component instance.
	 */
	public readonly children: ChildGeneric[];

	public constructor(props: PropsGeneric, ...children: ChildGeneric[]) {
		this.props = props;
		this.children = children;
	}

	/**
	 * Create a DOM node for this XML component, one that can be stringified to schema-valid OOXML.
	 *
	 * By default, an XML component would serialize to its children and string contents -- like a
	 * fragment. Most components have an override to use specific OOXML elememnts, such as <w:p>.
	 */
	public toNode(): string | Node | (string | Node)[] {
		return this.children.reduce<(string | Node)[]>((flat, child) => {
			const s: string | Node | (string | Node)[] =
				typeof child === 'string' ? child : child.toNode();
			return Array.isArray(s) ? flat.concat(s) : [...flat, s];
		}, []);
	}
}
