import { AnyXmlComponent, XmlComponent } from '../classes/XmlComponent.ts';
import { Ppr, PprI } from '../shared/ppr.ts';
import { RprI } from '../shared/rpr.ts';
import { createChildComponentsFromNodes, registerComponent } from '../util/components.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { TextAddition, TextDeletion } from './changes.ts';
import { Text } from './Text.ts';

export type ParagraphChild = Text | TextAddition | TextDeletion;

export type ParagraphProps = PprI & RprI;

/**
 * http://officeopenxml.com/WPparagraph.php
 */
export class Paragraph extends XmlComponent<ParagraphProps, ParagraphChild> {
	public static readonly children: string[] = [Text.name, TextAddition.name, TextDeletion.name];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: AnyXmlComponent[] = []): Node {
		return create(
			`
				element ${QNS.w}p {
					$pPr,
					for $child in $children
						return $child
				}
			`,
			{
				pPr: Ppr.toNode(this.props),
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
				...Ppr.fromNode(ppr),
				...props,
			},
			...createChildComponentsFromNodes<ParagraphChild>(this.children, children),
		);
	}
}
registerComponent(Paragraph);
