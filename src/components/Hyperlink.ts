import './Text.ts';

import { type ComponentAncestor, Component } from '../classes/Component.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type Text } from './Text.ts';

/**
 * A type describing the components accepted as children of {@link Hyperlink}.
 */
export type HyperlinkChild = Text;

/**
 * A type describing the props accepted by {@link Hyperlink}.
 */
export type HyperlinkProps = {
	anchor: string;
	tooltip?: string;
};

/**
 * A component that represents a hyperlink to another part of the same document.
 */
export class Hyperlink extends Component<HyperlinkProps, HyperlinkChild> {
	public static readonly children: string[] = ['Text'];

	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}hyperlink {
					attribute ${QNS.w}anchor { $anchor },
					attribute ${QNS.w}tooltip { $tooltip },
					$children
				}
			`,
			{
				anchor: this.props.anchor,
				tooltip: this.props.tooltip || null,
				children: await this.childrenToNode(ancestry),
			},
		);
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:hyperlink';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): Hyperlink {
		const { children, ...props } = evaluateXPathToMap<HyperlinkProps & { children: Node[] }>(
			`map {
				"anchor": ./@${QNS.w}anchor/string(),
				"tooltip": ./@${QNS.w}tooltip/string()
			}`,
			node,
		);
		return new Hyperlink(
			props,
			...createChildComponentsFromNodes<HyperlinkChild>(this.children, children),
		);
	}
}

registerComponent(Hyperlink);
