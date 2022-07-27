import { XmlComponent, XmlComponentClassDefinition } from '../classes/XmlComponent.ts';
import { Ppr, PprI } from '../shared/ppr.ts';
import { RprI } from '../shared/rpr.ts';
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
	public static children = [Text, TextAddition, TextDeletion] as XmlComponentClassDefinition[];
	public static mixed = false;

	public toNode(): Node {
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
				children: super.toNode(),
			},
		);
	}

	static matchesNode(node: Node) {
		return node.nodeName === 'w:p';
	}

	static fromNode(node: Node): Paragraph {
		const { childNodes, ppr, ...props } = evaluateXPathToMap(
			`
				map {
					"ppr": ./${QNS.w}pPr,
					"style": ./${QNS.w}pPr/${QNS.w}pStyle/@${QNS.w}val/string(),
					"childNodes": array{ ./(${QNS.w}r | ${QNS.w}del | ${QNS.w}ins) }
				}
			`,
			node,
		) as { ppr: Node; childNodes: Node[]; style?: string };

		const children = childNodes
			.map((node) => this.children.find((Child) => Child.matchesNode(node))?.fromNode(node) || null)
			.filter((child): child is Exclude<typeof child, null> => !!child);

		return new Paragraph(
			{
				...Ppr.fromNode(ppr),
				...props,
			},
			...(children as ParagraphChild[]),
		);
	}
}
