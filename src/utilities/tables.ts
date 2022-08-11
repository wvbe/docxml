import type { Cell } from '../components/Cell.ts';
import type { Table } from '../components/Table.ts';

type CellCoordinate = `${number},${number}`;

function coord(x: number, y: number): CellCoordinate {
	return `${x},${y}`;
}

type CellInfo = {
	/**
	 * The Y coordinate of the top edge.
	 */
	row: number;
	/**
	 * The X coordinate of the left edge.
	 */
	column: number;
	/**
	 * @deprecated Can be replaced with cell.getRowSpan()
	 */
	rowspan: number;
	/**
	 * @deprecated Can be replaced with cell.getColSpan()
	 */
	colspan: number;
};

/**
 * A conceptual description of the table that makes it easier to reason about it.
 */
export class TableGridModel {
	/**
	 * A map of which col/row coordinates are filled by a cell.
	 */
	private readonly _occupancy = new Map<CellCoordinate, Cell>();

	/**
	 * The coordinate and size information about a cell.
	 */
	private readonly _info = new Map<Cell, CellInfo>();

	public constructor(table: Table) {
		table.children.forEach((row, rowIndex) => {
			row.children.forEach((cell) => {
				const colIndex = this._getFirstAvailableColumnOnRow(rowIndex);
				for (let y = rowIndex; y < rowIndex + cell.getRowSpan(); y++) {
					for (let x = colIndex; x < colIndex + cell.getColSpan(); x++) {
						const key = coord(x, y);
						if (this._occupancy.has(key)) {
							// This should never happen so long as the colspans/rowspans make sense.
							throw new Error(`Cell ${x},${y} already occupied.`);
						}
						this._occupancy.set(key, cell);
					}
				}
				if (!this._info.has(cell)) {
					this._info.set(cell, {
						row: rowIndex,
						column: colIndex,
						rowspan: cell.getRowSpan(),
						colspan: cell.getColSpan(),
					});
				}
			});
		});
	}

	/**
	 * Return the zero-based column number of the first unfilled cell on the given row
	 */
	private _getFirstAvailableColumnOnRow(y: number) {
		const columnsOccupied = Array.from(this._occupancy.keys())
			.filter((key) => key.endsWith(`,${y}`))
			.map((key) => parseInt(key.split(',')[0], 10))
			.sort();
		for (let i = 0; i < columnsOccupied.length; i++) {
			if (i !== columnsOccupied[i]) {
				return i;
			}
		}
		return columnsOccupied.length;
	}

	/**
	 * Return the <td> node belonging to this column/row coordinate, taking all colspans/rowspans
	 * into account.
	 */
	public getNodeAtCell(column: number, row: number) {
		return this._occupancy.get(coord(column, row)) || null;
	}

	/**
	 * Get the number of columns in a row, even if some cells span multiple columns.
	 */
	public getCellsInRow(row: number) {
		// TODO could be simplified if we knew the table is rectangular
		return (
			Array.from(this._occupancy.keys())
				.filter((key) => key.endsWith(`,${row}`))
				.map((key) => key.split(',').map((n) => parseInt(n, 10)))
				.sort((a, b) => a[0] - b[0])
				// TODO take into accoutn the edge case that .getNodeAtCell returns null
				.map(([x, y]) => this.getNodeAtCell(x, y) as Cell)
		);
	}

	/**
	 * Return the position and spanning of a given <td> node, keeping all colspans/rowspans of other
	 * cels into account.
	 */
	public getCellInfo(cell: Cell): CellInfo {
		const info = this._info.get(cell);
		if (!info) {
			throw new Error(`The given cell does not exist in this table`);
		}
		return info;
	}
}
