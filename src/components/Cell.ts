import { XmlComponent } from '../classes/XmlComponent.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Paragraph } from './Paragraph.ts';

export type CellChild = Paragraph;

export type CellProps = { [key: string]: never };

export class Cell extends XmlComponent<CellProps, CellChild> {
	public static children = [Paragraph];
	public static mixed = false;

	public toNode(): Node {
		return create(
			`
				element ${QNS.w}tc {
					for $child in $children
						return $child
				}
			`,
			{
				children: super.toNode(),
			},
		);
	}

	static matchesNode(node: Node) {
		return node.nodeName === 'w:tc';
	}

	static fromNode(node: Node): Cell {
		const { children } = evaluateXPathToMap(
			`
				map {
					"children": array{ ./(${QNS.w}p) }
				}
			`,
			node,
		) as { children: Node[] };
		return new Cell(
			{},
			...children
				.map(
					(node) => this.children.find((Child) => Child.matchesNode(node))?.fromNode(node) || null,
				)
				.filter((child): child is Exclude<typeof child, null> => !!child),
		);
	}
}
