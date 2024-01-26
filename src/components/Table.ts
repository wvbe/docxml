// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import './Row.ts';
import './RowAddition.ts';
import './RowDeletion.ts';
import { checkForForbiddenParameters } from '../utilities/argument-checking.ts';

import { type ComponentAncestor, Component, ComponentContext } from '../classes/Component.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../properties/table-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { type Length, twip } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { TableGridModel } from '../utilities/tables.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { type Row } from './Row.ts';
import { type RowAddition } from './RowAddition.ts';
import { type RowDeletion } from './RowDeletion.ts';

/**
 * A type describing the components accepted as children of {@link Table}.
 */
export type TableChild = Row | RowAddition | RowDeletion;

/**
 * A type describing the props accepted by {@link Table}.
 */
export type TableProps = TableProperties & {
	columnWidths?: null | Length[];
};

/**
 * A component that represents a table.
 */
export class Table extends Component<TableProps, TableChild> {
	public static readonly children: string[] = ['Row', 'RowAddition', 'RowDeletion'];
	public static readonly mixed: boolean = false;

	/**
	 * A conceptual description of how the cells, columns, rows and spans of this table make sense.
	 *
	 * Exposed so it can be accessed by {@link Row} and {@link Cell} descendants, but not meant
	 * to be used otherwise.
	 */
	public readonly model = new TableGridModel(this);

	public constructor(tableProps: TableProps, ...tableChildren: TableChild[]) {
		checkForForbiddenParameters(tableProps, (x) => { return typeof x === 'number' && Number.isNaN(x) }, true);
		super(tableProps, ...tableChildren);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const node = create(
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
				children: await this.childrenToNode(ancestry),
			},
		);
		return node;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tbl';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node, context: ComponentContext): Table {
		const { children, tblpr, ...props } = evaluateXPathToMap<{
			tblpr: Node;
			children: Node[];
			columnWidths: number[];
		}>(
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
		);
		return new Table(
			{
				columnWidths: props.columnWidths.map((size: number) => twip(size)),
				...tablePropertiesFromNode(tblpr),
			},
			...createChildComponentsFromNodes<TableChild>(this.children, children, context),
		);
	}
}

registerComponent(Table);
