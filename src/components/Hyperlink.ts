import './Text.ts';

import { Bookmark } from '../classes/Bookmarks.ts';
import { type ComponentAncestor, Component, ComponentContext } from '../classes/Component.ts';
import { RelationshipType } from '../enums.ts';
import { type RelationshipsXml } from '../files/RelationshipsXml.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type Field } from './Field.ts';
import { type Text } from './Text.ts';

/**
 * A type describing the components accepted as children of {@link Hyperlink}.
 */
export type HyperlinkChild = Text | Field;

/**
 * A type describing the props accepted by {@link Hyperlink}.
 */
export type HyperlinkProps =
	| {
			anchor: string;
			bookmark?: never;
			url?: never;
			tooltip?: string;
	  }
	| {
			anchor?: never;
			bookmark: Bookmark;
			url?: never;
			tooltip?: string;
	  }
	| {
			anchor?: never;
			bookmark?: never;
			url: string;
			tooltip?: string;
	  };

/**
 * A component that represents a hyperlink to another part of the same document.
 */
export class Hyperlink extends Component<HyperlinkProps, HyperlinkChild> {
	public static readonly children: string[] = ['Text', 'Field'];

	public static readonly mixed: boolean = false;

	#relationshipId: string | null = null;

	public ensureRelationship(relationships: RelationshipsXml) {
		if (!this.props.url) {
			return;
		}
		this.#relationshipId = relationships.add(RelationshipType.hyperlink, this.props.url);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		return create(
			`
				element ${QNS.w}hyperlink {
					if(exists($relationshipId)) then attribute ${QNS.r}id { $relationshipId } else (),
					if(exists($anchor)) then attribute ${QNS.w}anchor { $anchor } else (),
					if(exists($tooltip)) then attribute ${QNS.w}tooltip { $tooltip } else (),
					$children
				}
			`,
			{
				relationshipId: this.#relationshipId,
				anchor: this.props.bookmark?.name || this.props.anchor || null,
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
	static fromNode(node: Node, context: ComponentContext): Hyperlink {
		const { children, ...props } = evaluateXPathToMap<HyperlinkProps & { children: Node[] }>(
			`map {
				"anchor": ./@${QNS.w}anchor/string(),
				"tooltip": ./@${QNS.w}tooltip/string(),
				"children": array{ ./(
					${QNS.w}r |
					${QNS.w}fldSimple
				) }
			}`,
			node,
		);
		return new Hyperlink(
			props,
			...createChildComponentsFromNodes<HyperlinkChild>(this.children, children, context),
		);
	}
}

registerComponent(Hyperlink);
