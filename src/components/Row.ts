import { XmlComponent } from '../classes/XmlComponent.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Cell } from './Cell.ts';

export type RowChild = Cell;

export type RowProps = { [key: string]: never };

export class Row extends XmlComponent<RowProps, RowChild> {
	public static children = [Cell];
	public static mixed = false;

	public toNode(): Node {
		return create(
			`
				element ${QNS.w}tr {
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
		return node.nodeName === 'w:tr';
	}

	static fromNode(node: Node): Row {
		const { children } = evaluateXPathToMap(
			`
				map {
					"children": array{ ./(${QNS.w}tc) }
				}
			`,
			node,
		) as { children: Node[] };
		return new Row(
			{},
			...children
				.map(
					(node) => this.children.find((Child) => Child.matchesNode(node))?.fromNode(node) || null,
				)
				.filter((child): child is Exclude<typeof child, null> => !!child),
		);
	}
}
