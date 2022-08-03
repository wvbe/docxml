import { Component, ComponentAncestor } from '../classes/Component.ts';
import {
	ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../properties/paragraph-properties.ts';
import { SectionProperties } from '../properties/section-properties.ts';
import { TextProperties } from '../properties/text-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { TextAddition, TextDeletion } from './changes.ts';
import { Text } from './Text.ts';

export type ParagraphChild = Text | TextAddition | TextDeletion;

export type ParagraphProps = ParagraphProperties & TextProperties;

/**
 * http://officeopenxml.com/WPparagraph.php
 */

export class Paragraph extends Component<ParagraphProps, ParagraphChild> {
	public static readonly children: string[] = [Text.name, TextAddition.name, TextDeletion.name];
	public static readonly mixed: boolean = false;
	private sectionProperties: SectionProperties | null = null;

	public setSectionProperties(properties?: SectionProperties | null) {
		this.sectionProperties = properties || null;
	}

	public toNode(ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}p {
					$pPr,
					for $child in $children
						return $child
				}
			`,
			{
				pPr: paragraphPropertiesToNode(this.props, this.sectionProperties),
				children: super.toNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:p';
	}

	static fromNode(node: Node): Paragraph {
		const { children, ppr, ...props } = evaluateXPathToMap(
			`
				map {
					"ppr": ./${QNS.w}pPr,
					"style": ./${QNS.w}pPr/${QNS.w}pStyle/@${QNS.w}val/string(),
					"children": array{ ./(${QNS.w}r | ${QNS.w}del | ${QNS.w}ins) }
				}
			`,
			node,
		) as { ppr: Node; children: Node[]; style?: string };

		return new Paragraph(
			{
				...paragraphPropertiesFromNode(ppr),
				...props,
			},
			...createChildComponentsFromNodes<ParagraphChild>(this.children, children),
		);
	}
}
registerComponent(Paragraph);
