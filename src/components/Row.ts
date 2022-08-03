import { Component, ComponentAncestor, ComponentDefinition } from '../classes/Component.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { Cell } from './Cell.ts';

export type RowChild = Cell;

export type RowProps = { [key: string]: never };

export class Row extends Component<RowProps, RowChild> {
	public static readonly children: string[] = [Cell.name];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}tr {
					for $child in $children
						return $child
				}
			`,
			{
				children: super.toNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
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
		return new Row({}, ...createChildComponentsFromNodes<RowChild>(this.children, children));
	}
}
registerComponent(Row as unknown as ComponentDefinition);
