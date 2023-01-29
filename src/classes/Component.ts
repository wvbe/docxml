import { type DocumentXml } from '../files/DocumentXml.ts';
import { type FooterXml, type HeaderXml } from '../files/HeaderFooterXml.ts';
import { type RelationshipsXml } from '../files/RelationshipsXml.ts';

/**
 * An ancestor of a component at serialization time, or the {@link DocumentXml} instance that is the
 * parent of the top-most component.
 *
 * Having this ancestry allows context-aware serialization.
 */
export type ComponentAncestor = DocumentXml | HeaderXml | FooterXml | AnyComponent;

/**
 * Any component instance, uncaring of which one or which props/children it has. Knows nothing,
 * assumes everything.
 */
export type AnyComponent = Component<{ [key: string]: unknown }, AnyComponent | string>;

/**
 * Utility type to retrieve the prop types of an Component
 */
export type ComponentProps<ComponentGeneric extends Component | unknown> =
	// deno-lint-ignore no-explicit-any
	ComponentGeneric extends Component<infer P, any> ? P : { [key: string]: never };

/**
 * Utility type to retrieve the children types of an Component
 */
export type ComponentChild<ComponentGeneric extends Component | unknown> =
	// deno-lint-ignore no-explicit-any
	ComponentGeneric extends Component<any, infer C> ? C : never;

/**
 * A secret property with which we can test wether or not a Class (or "Function" in JS land)
 * extends from Component
 */
const IS_COMPONENT = Symbol();

/**
 * The interface to which a class definition of an XML component must adhere -- ie.
 * it must have a `children` and `mixed` static properties.
 */
export interface ComponentDefinition<C extends AnyComponent | unknown = AnyComponent> {
	new (props: ComponentProps<C>, ...children: ComponentChild<C>[]): C;
	children: string[];
	mixed: boolean;
	matchesNode(node: Node): boolean;
	fromNode(node: Node): C;
	[IS_COMPONENT]: true;
}

/**
 * A custom function which which native components can be composed into something more easily
 * reusable.
 */
export type ComponentFunction<
	PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	ChildGeneric extends AnyComponent | string = never,
> = (props: PropsGeneric & { children?: ChildGeneric | ChildGeneric[] }) => AnyComponent;

/**
 * A component serializes to a string, or to an XML DOM node.
 */
type ComponentNode = string | Node;

/**
 * A component may serialize to one string/node, or multiple.
 */
export type ComponentNodes = ComponentNode | ComponentNode[];

// deno-lint-ignore no-explicit-any
export function isComponentDefinition(Def: ComponentDefinition | any): Def is ComponentDefinition {
	return Def && typeof Def === 'function' && Def[IS_COMPONENT] === true;
}

export abstract class Component<
	PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	ChildGeneric extends AnyComponent | string = never,
> {
	// eslint-disable-next-line @typescript-eslint/prefer-as-const
	public static [IS_COMPONENT]: true = true;

	/**
	 * Informs the JSX pragma which child components are allowed in this component.
	 * The JSX pragma can use this to attempt repairs at invalidly nested children.
	 */
	public static readonly children: string[] = [];

	/**
	 * Informs the JSX pragma on wether or not this component can contain text (string)
	 * children. The JSX pragma can use this to attempt repairs at invalidly nested children.
	 */
	public static readonly mixed: boolean = false;

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
	 * An event hook with which this component can ensure that the correct relationship type is
	 * recorded to the relationship XML.
	 *
	 * For example;
	 *
	 * - Create a relationship to a {@link Hyperlink} external target
	 * - Create a relationship from the {@link Image} component to its image file binary.
	 *
	 * You'll want to use {@link RelationshipsXml} to create a relationship and store its
	 * identifier somewhere, before using it in {@link Component.toNode}.
	 *
	 *     this.#relationshipId = relationships.add(RelationshipType.hyperlink, this.props.url);
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public ensureRelationship(_relationships: RelationshipsXml) {
		// no-op
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public static matchesNode(_node: Node): boolean {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public static fromNode(_node: Node): AnyComponent {
		throw new Error('Not implemented');
	}

	protected async childrenToNode(ancestry: Array<ComponentAncestor>): Promise<ComponentNode[]> {
		const anc = [this, ...ancestry];
		const nodes = await Promise.all(
			this.children.map((child) => (typeof child === 'string' ? child : child.toNode(anc))),
		);
		return nodes.reduce<ComponentNode[]>(
			(flat, s) => (Array.isArray(s) ? flat.concat(s) : [...flat, s]),
			[],
		);
	}

	/**
	 * Create a DOM node for this XML component, one that can be stringified to schema-valid OOXML.
	 *
	 * By default, an XML component would serialize to its children and string contents -- like a
	 * fragment. Most components have an override to use specific OOXML elememnts, such as <w:p>.
	 */
	public toNode(ancestry: Array<ComponentAncestor>): ComponentNodes | Promise<ComponentNodes> {
		return this.childrenToNode(ancestry);
	}
}
