import {
	Component,
	type ComponentAncestor,
	type ComponentContext,
} from '../../../classes/src/Component.ts';
import {
	type TableCellProperties,
	tableCellPropertiesToNode,
} from '../../../properties/src/table-cell-properties.ts';
import {
	createChildComponentsFromNodes,
	registerComponent,
} from '../../../utilities/src/components.ts';
import { create } from '../../../utilities/src/dom.ts';
import { QNS } from '../../../utilities/src/namespaces.ts';
import {
	checkForForbiddenParameters,
	isValidNumber,
} from '../../../utilities/src/parameter-checking.ts';
import { evaluateXPathToMap } from '../../../utilities/src/xquery.ts';
import { CellDeletion } from '../../track-changes/src/CellDeletion.ts';
import { CellInsertion } from '../../track-changes/src/CellInsertion.ts';
import type { Deletion } from '../../track-changes/src/Deletion.ts';
import type { Insertion } from '../../track-changes/src/Insertion.ts';
import type { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import type { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import { Paragraph } from './Paragraph.ts';
import { Row } from './Row.ts';
import { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Cell}.
 */
export type CellChild =
	| Paragraph
	| Table
	| BookmarkRangeStart
	| BookmarkRangeEnd
	| Insertion
	| Deletion
	| CellInsertion
	| CellDeletion;

/**
 * A type describing the props accepted by {@link Cell}.
 */
export type CellProps = Omit<TableCellProperties, 'width'>;

/**
 * A component that represents a table cell.
 *
 * For MS Word to be happy any cell needs to have a paragraph as the last child. This component will
 * quietly fix that for you if you don't have a paragraph there already.
 */
export class Cell extends Component<CellProps, CellChild> {
	public static override readonly children: string[] = [
		'Paragraph',
		'Table',
		'BookmarkRangeStart',
		'BookmarkRangeEnd',
		'CellInsertion',
		'CellDeletion',
	];
	public static override readonly mixed: boolean = false;

	public constructor(cellProps: CellProps, ...cellChild: CellChild[]) {
		// Ensure that properties of type `number` are not `NaN`.
		checkForForbiddenParameters(cellProps, isValidNumber, true);
		super(cellProps, ...cellChild);
	}

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public override async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const table = ancestry.find((a): a is Table => a instanceof Table);
		if (!table) throw new Error('A cell must be inside a table');

		/* 1. Create tcPr-level change nodes ONCE (from props, not children) */
		const tcPrChangeNodes: Node[] = [];
		if (this.props.insertion) {
			tcPrChangeNodes.push(
				new CellInsertion(this.props.insertion).toNode() // no ancestry needed
			);
		}
		if (this.props.deletion) {
			tcPrChangeNodes.push(
				new CellDeletion(this.props.deletion).toNode()
			);
		}

		/* 2. Normal children go into the cell body */
		const bodyNodes: Node[] = [];
		for (const child of this.children) {
			bodyNodes.push(await child.toNode([this, ...ancestry]));
		}

		/* ensure cell ends with a paragraph */
		if (!(this.children.at(-1) instanceof Paragraph)) {
			bodyNodes.push(await new Paragraph({}).toNode([this, ...ancestry]));
		}

		/* 3. Build <tcPr> WITHOUT insertion/deletion props */
		const {
			insertion: _insertion,
			deletion: _deletion,
			...pureTcPrProps
		} = this.props; // strip them
		const tcPrNode = await tableCellPropertiesToNode(
			{
				colSpan: this.getColSpan(),
				rowSpan: this.getRowSpan(),
				width:
					table.props.columnWidths?.[
						table.model.getCellInfo(this).column
					] ?? null,
				...pureTcPrProps,
			},
			false
		);
		tcPrChangeNodes.forEach((n) => tcPrNode?.appendChild(n));

		/* 4. Assemble the cell */
		return create(`element ${QNS.w}tc { $tcPr, $body }`, {
			tcPr: tcPrNode,
			body: bodyNodes,
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async toRepeatingNode(
		ancestry: ComponentAncestor[],
		column: number,
		_row: number
	): Promise<Node | null> {
		const table = ancestry.find(
			(ancestor): ancestor is Table => ancestor instanceof Table
		);
		if (!table) {
			throw new Error(
				'A cell cannot be rendered outside the context of a table'
			);
		}

		const info = table.model.getCellInfo(this);
		if (column > info.column) {
			// Colspans are only recorded on the left-most cell coordinate. No extra node needed;
			return null;
		}

		return create(
			`element ${QNS.w}tc {
				$tcPr,
				element ${QNS.w}p {}
			}`,
			{
				tcPr: await tableCellPropertiesToNode(
					{
						width: table.props.columnWidths?.[info.column] || null,
						colSpan: this.getColSpan(),
						rowSpan: this.getRowSpan(),
						...this.props,
					},
					true
				),
			}
		);
	}

	/**
	 * Returns `true` when this cell has no visual representation because a column-spanning or row-
	 * spanning neighbour overlaps it.
	 */
	public isMergedAway(ancestry: ComponentAncestor[]): boolean {
		const row = ancestry.find(
			(ancestor): ancestor is Row => ancestor instanceof Row
		);
		if (!row) {
			throw new Error(
				'A cell cannot be rendered outside the context of a row'
			);
		}
		const table = ancestry.find(
			(ancestor): ancestor is Table => ancestor instanceof Table
		);
		if (!table) {
			throw new Error(
				'A cell cannot be rendered outside the context of a table'
			);
		}
		const x = row.children.indexOf(this);
		const y = table.children.indexOf(row);
		if (y === -1 || x === -1) {
			throw new Error('The cell is not part of this table');
		}

		const info = table.model.getCellInfo(this);
		return info.column !== x || info.row !== y;
	}

	public getColSpan(): number {
		return this.props.colSpan || 1;
	}

	public getRowSpan(): number {
		return this.props.rowSpan || 1;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static override matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tc';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static override fromNode(
		node: Node,
		context: ComponentContext
	): null | Cell {
		const { mergedAway, children, ...props } = evaluateXPathToMap<
			CellProps & { mergedAway: boolean; children: Node[] }
		>(
			`
				let $colStart := docxml:cell-column(.)

				let $rowStart := count(../preceding-sibling::${QNS.w}tr)

				let $firstNextRow := ../following-sibling::${QNS.w}tr[
					child::${QNS.w}tc[docxml:spans-cell-column(., $colStart) and not(
						./${QNS.w}tcPr/${QNS.w}vMerge[
							@${QNS.w}val = "continue" or
							not(./@${QNS.w}val)
						]
					)]
				][1]

				let $rowEnd := if ($firstNextRow)
					then count($firstNextRow/preceding-sibling::${QNS.w}tr)
					else count(../../${QNS.w}tr)

				let $mergeCell := boolean(./${QNS.w}tcPr/${QNS.w}vMerge[not(./@${QNS.w}val)])

				return map {
					"mergedAway": $mergeCell,
					"colSpan": if (./${QNS.w}tcPr/${QNS.w}gridSpan)
						then ./${QNS.w}tcPr/${QNS.w}gridSpan/@${QNS.w}val/number()
						else 1,
					"rowSpan": $rowEnd - $rowStart,
					"children": array{
						./(${QNS.w}p),
						./${QNS.w}tcPr/${QNS.w}cellIns,
						./${QNS.w}tcPr/${QNS.w}cellDel
					},
					"verticalAlignment": ./${QNS.w}tcPr/${QNS.w}vAlign/@${QNS.w}val/string()
				}
			`,
			node
		);
		if (mergedAway) {
			return null;
		}
		return new Cell(
			props,
			...createChildComponentsFromNodes<CellChild>(
				this.children,
				children,
				context
			)
		);
	}
}

registerComponent(Cell);
