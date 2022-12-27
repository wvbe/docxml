import { type ComponentAncestor, Component } from '../classes/Component.ts';
import { registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';

/**
 * A type describing the components accepted as children of {@link Tab}.
 */
export type TabChild = never;

/**
 * A type describing the props accepted by {@link Tab}.
 */
export type TabProps = { [key: string]: never };

/**
 * A component that represents a tab space in a DOCX document. Place
 * this in one of the `<Text>`, `<TextAddition>` or `<TextDeletion>` components.
 */
export class Tab extends Component<TabProps, TabChild> {
	public static readonly children: string[] = [];

	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toNode(_ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}tab {}
			`,
			{},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tab';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static fromNode(_node: Node): Tab {
		return new Tab({});
	}
}

registerComponent(Tab);
