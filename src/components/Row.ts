import {
	AnyXmlComponentAncestor,
	XmlComponent,
	XmlComponentClassDefinition,
} from '../classes/XmlComponent.ts';
import { createChildComponentsFromNodes, registerComponent } from '../util/components.ts';
import { create } from '../util/dom.ts';
import { QNS } from '../util/namespaces.ts';
import { evaluateXPathToMap } from '../util/xquery.ts';
import { Cell } from './Cell.ts';

export type RowChild = Cell;

export type RowProps = { [key: string]: never };

export class Row extends XmlComponent<RowProps, RowChild> {
	public static readonly children: string[] = [Cell.name];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: AnyXmlComponentAncestor[]): Node {
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
registerComponent(Row as unknown as XmlComponentClassDefinition);
