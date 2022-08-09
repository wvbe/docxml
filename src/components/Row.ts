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
import { evaluateXPathToBoolean, evaluateXPathToMap } from '../utilities/xquery.ts';
import type { Cell } from './Cell.ts';
import type { RowAddition } from './RowAddition.ts';
import type { RowDeletion } from './RowDeletion.ts';
import { Table } from './Table.ts';

export type RowChild = Cell;

export type RowProps = { [key: string]: never };

/**
 * For reuse between Row, RowAddition and RowDeletion
 */
export function parsePropsAndChildNodes(node: Node) {
	return evaluateXPathToMap(
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
	) as RowProps & { children: Node[] };
}

/**
 * For reuse between Row, RowAddition and RowDeletion
 */
export function createNodeFromRow(
	row: Row | RowAddition | RowDeletion,
	ancestry: ComponentAncestor[],
): Node {
	const table = ancestry.find((ancestor): ancestor is Table => ancestor instanceof Table);
	if (!table) {
		throw new Error('A row cannot be rendered outside the context of a table');
	}
	const y = (ancestry[0].children as AnyComponent[]).indexOf(row);
	const anc = [row, ...ancestry];
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

export class Row extends Component<RowProps, RowChild> {
	public static readonly children: string[] = ['Cell'];
	public static readonly mixed: boolean = false;

	public toNode(ancestry: ComponentAncestor[]): Node {
		return createNodeFromRow(this, ancestry);
	}

	static matchesNode(node: Node): boolean {
		return evaluateXPathToBoolean(
			`
				self::${QNS.w}tr and
				not(./${QNS.w}trPr/${QNS.w}ins) and
				not(./${QNS.w}trPr/${QNS.w}del)
			`,
			node,
		);
	}

	static fromNode(node: Node): Row {
		const { children, ...props } = parsePropsAndChildNodes(node);
		return new Row(props, ...createChildComponentsFromNodes<RowChild>(this.children, children));
	}
}
registerComponent(Row as unknown as ComponentDefinition);
