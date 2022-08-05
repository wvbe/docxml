// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Cell.ts';

import {
	AnyComponent,
	Component,
	ComponentAncestor,
	ComponentDefinition,
} from '../classes/Component.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import type { Cell } from './Cell.ts';
import { Table } from './Table.ts';

export type RowChild = Cell;

export type RowProps = { [key: string]: never };

export class Row extends Component<RowProps, RowChild> {
	public static readonly children: string[] = ['Cell'];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: ComponentAncestor[]): Node {
		const table = ancestry.find((ancestor): ancestor is Table => ancestor instanceof Table);
		if (!table) {
			throw new Error('A row cannot be rendered outside the context of a table');
		}
		const y = (ancestry[0].children as AnyComponent[]).indexOf(this);
		const anc = [this, ...ancestry];
		return create(
			`
				element ${QNS.w}tr {
					$children
				}
			`,
			{
				children: table.model.getCellsInRow(y).map((cell, x) => {
					const info = table.model.getCellInfo(cell);
					return info.column === x && info.row === y
						? cell.toNode(anc)
						: cell.toRepeatingNode(anc, x, y);
				}),
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
					"children": array{
						./${QNS.w}tc[
							not(./${QNS.w}tcPr/${QNS.w}vMerge/@${QNS.w}val = "continue")
						]
					}
				}
			`,
			node,
		) as { children: Node[] };
		return new Row({}, ...createChildComponentsFromNodes<RowChild>(this.children, children));
	}
}
registerComponent(Row as unknown as ComponentDefinition);
