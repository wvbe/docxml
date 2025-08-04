// Import without assignment ensures Deno does not tree-shake this component. To avoid circular
// definitions, components register themselves in a side-effect of their module.
import {
	checkForForbiddenParameters,
	isValidNumber,
} from '../../../utilities/src/parameter-checking.ts';
import '../../track-changes/src/RowDeletion.ts';
import './Row.ts';

import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../../../properties/src/table-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { type Length, twip } from '../../../utilities/src/length.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import { TableGridModel } from '../../../utilities/src/tables.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import type { RowDeletion } from '../../track-changes/src/RowDeletion.ts';
import type { Row } from './Row.ts';

/**
 * A type describing the components accepted as children of {@link Table}.
 */
export type TableChild = Row | RowDeletion;

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
	public static override readonly children: string[] = ['Row', 'RowDeletion'];
	public static override readonly mixed: boolean = false;

	/**
	 * A conceptual description of how the cells, columns, rows and spans of this table make sense.
	 *
	 * Exposed so it can be accessed by {@link Row} and {@link Cell} descendants, but not meant
	 * to be used otherwise.
	 */
	public readonly model: TableGridModel = new TableGridModel(this);

	public constructor(tableProps: TableProps, ...tableChildren: TableChild[]) {
		checkForForbiddenParameters(tableProps, isValidNumber, true);
		super(tableProps, ...tableChildren);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
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
					? this.props.columnWidths.map((width) =>
							Math.round(width.twip)
					  )
					: null,
				children: await this.childrenToNode(ancestry),
			}
		);
		return node;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tbl';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(node: Node, context: ComponentContext): Table {
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
			node
		);
		return new Table(
			{
				columnWidths: props.columnWidths.map((size: number) =>
					twip(size)
				),
				...tablePropertiesFromNode(tblpr),
			},
			...createChildComponentsFromNodes<TableChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Table);
