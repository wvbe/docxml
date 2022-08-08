// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Row.ts';

import type { ComponentAncestor } from '../classes/Component.ts';
import { Component } from '../classes/Component.ts';
import type { TableProperties } from '../properties/table-properties.ts';
import { tablePropertiesFromNode, tablePropertiesToNode } from '../properties/table-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import type { UniversalSize } from '../utilities/length.ts';
import { twip } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { TableGridModel } from '../utilities/tables.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import type { Row } from './Row.ts';

export type TableChild = Row;

export type TableProps = TableProperties & {
	columnWidths?: null | UniversalSize[];
};

export class Table extends Component<TableProps, TableChild> {
	public static readonly children: string[] = ['Row'];
	public static readonly mixed: boolean = false;

	private _model: TableGridModel | null = null;
	public get model() {
		if (!this._model) {
			this._model = new TableGridModel(this);
		}
		return this._model;
	}

	public toNode(ancestry: ComponentAncestor[]): Node {
		return create(
			`
				element ${QNS.w}tbl {
					$tablePropertiesNode,
					if (exists($columnWidths)) then element ${QNS.w}tblGrid {
						for $columnWidth in array:flatten($columnWidths) return element ${QNS.w}gridCol {
							attribute ${QNS.w}w { $columnWidth }
						}
					} else (),
					$children
				}
			`,
			{
				tablePropertiesNode: tablePropertiesToNode(this.props),
				columnWidths: this.props.columnWidths?.length
					? this.props.columnWidths.map((width) => Math.round(width.twip))
					: null,
				children: this.childrenToNode(ancestry),
			},
		);
	}

	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tbl';
	}

	static fromNode(node: Node): Table {
		const { children, tblpr, ...props } = evaluateXPathToMap(
			`
				map {
					"tblpr": ./${QNS.w}tblPr,
					"columnWidths": array {
						./${QNS.w}tblGrid/${QNS.w}gridCol/@${QNS.w}w/number()
					},
					"children": array{ ./(${QNS.w}tr) }
				}
			`,
			node,
		) as { tblpr: Node; children: Node[]; columnWidths: number[] };
		return new Table(
			{
				columnWidths: props.columnWidths.map((size: number) => twip(size)),
				...tablePropertiesFromNode(tblpr),
			},
			...createChildComponentsFromNodes<TableChild>(this.children, children),
		);
	}
}
registerComponent(Table);
