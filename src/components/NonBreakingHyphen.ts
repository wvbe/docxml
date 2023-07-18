import { Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';

/**
 * A type describing the components accepted as children of {@link NonBreakingHyphen}.
 */
export type NonBreakingHyphenChild = never;

/**
 * A type describing the props accepted by {@link NonBreakingHyphen}.
 */
export type NonBreakingHyphenProps = { [key: string]: never };

/**
 * A component that represents a non-breaking hyphen. Place this in the `<Text>` component.
 */
export class NonBreakingHyphen extends Component<NonBreakingHyphenProps, NonBreakingHyphenChild> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public toNode(): Node {
		return create(`element ${QNS.w}noBreakHyphen {}`);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:noBreakHyphen';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(): NonBreakingHyphen {
		return new NonBreakingHyphen({});
	}
}

registerComponent(NonBreakingHyphen);
