import { type ComponentAncestor, Component } from '../classes/Component.ts';
import {
	type TableCellProperties,
	tableCellPropertiesToNode,
} from '../properties/table-cell-properties.ts';
import { createChildComponentsFromNodes, registerComponent } from '../utilities/components.ts';
import { create } from '../utilities/dom.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { BookmarkRangeEnd } from './BookmarkRangeEnd.ts';
import { BookmarkRangeStart } from './BookmarkRangeStart.ts';
import { Paragraph } from './Paragraph.ts';
import { Table } from './Table.ts';

/**
 * A type describing the components accepted as children of {@link Cell}.
 */
export type CellChild = Paragraph | Table | BookmarkRangeStart | BookmarkRangeEnd;

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
	public static readonly children: string[] = [
		'Paragraph',
		'Table',
		'BookmarkRangeStart',
		'BookmarkRangeEnd',
	];
	public static readonly mixed: boolean = false;

	/**
	 * Creates an XML DOM node for this component instance.
	 */
	public async toNode(ancestry: ComponentAncestor[]): Promise<Node> {
		const table = ancestry.find((ancestor): ancestor is Table => ancestor instanceof Table);
		if (!table) {
			throw new Error('A row cannot be rendered outside the context of a table');
		}

		const children = (await this.childrenToNode(ancestry)) as Node[];
		if (!(this.children[this.children.length - 1] instanceof Paragraph)) {
			// Cells must always end with a paragraph, or MS Word will complain about
			// file corruption.
			children.push(await new Paragraph({}).toNode([this, ...ancestry]));
		}

		return create(
			`element ${QNS.w}tc {
				$tcPr,
				$children
			}`,
			{
				tcPr: tableCellPropertiesToNode(
					{
						colSpan: this.getColSpan(),
						rowSpan: this.getRowSpan(),
						width: table.props.columnWidths?.[table.model.getCellInfo(this).column] || null,
						...this.props,
					},
					false,
				),
				children,
			},
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public toRepeatingNode(ancestry: ComponentAncestor[], column: number, _row: number): Node | null {
		const table = ancestry.find((ancestor): ancestor is Table => ancestor instanceof Table);
		if (!table) {
			throw new Error('A row cannot be rendered outside the context of a table');
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
				tcPr: tableCellPropertiesToNode(
					{
						width: table.props.columnWidths?.[info.column] || null,
						colSpan: this.getColSpan(),
						rowSpan: this.getRowSpan(),
						...this.props,
					},
					true,
				),
			},
		);
	}

	public getColSpan() {
		return this.props.colSpan || 1;
	}

	public getRowSpan() {
		return this.props.rowSpan || 1;
	}

	/**
	 * Asserts whether or not a given XML node correlates with this component.
	 */
	static matchesNode(node: Node): boolean {
		return node.nodeName === 'w:tc';
	}

	/**
	 * Instantiate this component from the XML in an existing DOCX file.
	 */
	static fromNode(node: Node): Cell {
		const { children, ...props } = evaluateXPathToMap<CellProps & { children: Node[] }>(
			`
				let $colStart := docxml:cell-column(.)

				let $rowStart := count(../preceding-sibling::${QNS.w}tr)

				let $firstNextRow := ../following-sibling::${QNS.w}tr[
					child::${QNS.w}tc[docxml:cell-column(.) = $colStart and not(
						./${QNS.w}tcPr/${QNS.w}vMerge[
							@${QNS.w}val = "continue" or
							not(./@${QNS.w}val)
						]
					)]
				][1]

				let $rowEnd := if ($firstNextRow)
					then count($firstNextRow/preceding-sibling::${QNS.w}tr)
					else count(../../${QNS.w}tr) - 1

				return map {
					"colSpan": if (./${QNS.w}tcPr/${QNS.w}gridSpan)
						then ./${QNS.w}tcPr/${QNS.w}gridSpan/@${QNS.w}val/number()
						else 1,
					"rowSpan": $rowEnd - $rowStart,
					"children": array{ ./(${QNS.w}p) }
				}
			`,
			node,
		);
		return new Cell(props, ...createChildComponentsFromNodes<CellChild>(this.children, children));
	}
}

registerComponent(Cell);
