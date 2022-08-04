import { Component, ComponentAncestor } from '../classes/Component.ts';
import {
	TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../properties/table-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { twip, UniversalSize } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { TableGridModel } from '../utilities/tables.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { Cell } from './Cell.ts';
import { Row } from './Row.ts';

export type TableChild = Row;

export type TableProps = TableProperties & {
	columnWidths?: null | UniversalSize[];
};

export class Table extends Component<TableProps, TableChild> {
	public static readonly children: string[] = [Row.name];
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
					? this.props.columnWidths.map((width) => width.twip)
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

	/**
	 * @deprecated unreliable function behavior, work in progress!
	 */
	public isRectangular() {
		const rowWidths: number[] = [];
		const colHeights: number[] = [];

		for (let y = 0; y < this.children.length; y++) {
			const row = this.children[y];
			for (let x = 0; x < row.children.length; x++) {
				const cell = row.children[x];
				const rowSpans = cell.props.rowSpan || 1;
				const colSpans = cell.props.colSpan || 1;

				// Add to the total width of any row that this cell spans across
				for (let rowSpanned = 0; rowSpanned < rowSpans; rowSpanned++) {
					rowWidths[y + rowSpanned] =
						rowWidths[y + rowSpanned] === undefined
							? colSpans
							: rowWidths[y + rowSpanned] + colSpans;
				}

				// Add to the total height of any column that this cell spans across
				for (let colSpanned = 0; colSpanned < colSpans; colSpanned++) {
					colHeights[x + colSpanned] =
						colHeights[x + colSpanned] === undefined
							? rowSpans
							: colHeights[x + colSpanned] + rowSpans;
				}
			}
		}

		for (let i = 1; i < rowWidths.length; i++) {
			if (rowWidths[i] !== rowWidths[i - 1]) {
				throw new Error(
					`Row ${i + 1} spans ${rowWidths[i]} grid columns, but expected ${rowWidths[i - 1]}`,
				);
			}
		}

		for (let i = 1; i < colHeights.length; i++) {
			if (colHeights[i] !== colHeights[i - 1]) {
				throw new Error(
					`Column ${i + 1} spans ${colHeights[i]} grid rows, but expected ${colHeights[i - 1]}`,
				);
			}
		}

		return true;
	}

	/**
	 * @deprecated unreliable function behavior, work in progress!
	 */
	public getCellProperties(cell: Cell) {
		const row = this.children.find((row) => row.children.includes(cell));
		if (!row) {
			throw new Error('Cell is not part of this table');
		}
		const nthColumn = row.children.indexOf(cell);
		const width = (this.props.columnWidths || [])[nthColumn] || twip(0);

		return {
			width,
			gridSpan: 1, // horizontal spanning, colSpan
			vMerge: null,
		};
	}
}
registerComponent(Table);
