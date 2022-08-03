import type { OfficeDocument } from '../files/OfficeDocument.ts';

/**
 * An ancestor of a component at serialization time, or the OfficeDocument instance that is the
 * parent of the top-most component.
 *
 * Having this ancestry allows context-aware serialization.
 */
export type ComponentAncestor = OfficeDocument | AnyComponent;

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
 * The interface to which a class definition of an XML component must adhere -- ie.
 * it must have a `children` and `mixed` static properties.
 */
export interface ComponentDefinition<C extends AnyComponent | unknown = AnyComponent> {
	new (props: ComponentProps<C>, ...children: ComponentChild<C>[]): C;
	children: string[];
	mixed: boolean;
	matchesNode(node: Node): boolean;
	fromNode(node: Node): C;
}

/**
 * If an XML component is written to DOM, it could be represented by any node, or a flat string,
 * or multiple of them.
 */
type ComponentNodes = string | Node | (string | Node)[];

export abstract class Component<
	PropsGeneric extends { [key: string]: unknown } = { [key: string]: never },
	ChildGeneric extends AnyComponent | string = never,
> {
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public static matchesNode(_node: Node): boolean {
		return false;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public static fromNode(_node: Node): AnyComponent {
		throw new Error('Not implemented');
	}

	/**
	 * Create a DOM node for this XML component, one that can be stringified to schema-valid OOXML.
	 *
	 * By default, an XML component would serialize to its children and string contents -- like a
	 * fragment. Most components have an override to use specific OOXML elememnts, such as <w:p>.
	 */
	public toNode(ancestry: Array<ComponentAncestor>): ComponentNodes {
		const anc = [this, ...ancestry];
		return this.children.reduce<(string | Node)[]>((flat, child) => {
			const s: ComponentNodes = typeof child === 'string' ? child : child.toNode(anc);
			return Array.isArray(s) ? flat.concat(s) : [...flat, s];
		}, []);
	}
}
