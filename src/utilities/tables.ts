import type { Cell } from '../components/Cell.ts';
import type { Table } from '../components/Table.ts';

type CellCoordinate = `${number},${number}`;

function coord(x: number, y: number): CellCoordinate {
	return `${x},${y}`;
}

type CellInfo = {
	row: number;
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
 * Only exported for test purposes
 */
export class TableGridModel {
	private readonly occupation = new Map<CellCoordinate, Cell>();
	private readonly cellNodes = new Map<Cell, CellInfo>();

	public constructor(table: Table) {
		table.children.forEach((row, rowIndex) => {
			row.children.forEach((cell) => {
				const colIndex = this.getFirstAvailableColumnOnRow(rowIndex);
				for (let y = rowIndex; y < rowIndex + cell.getRowSpan(); y++) {
					for (let x = colIndex; x < colIndex + cell.getColSpan(); x++) {
						const key = coord(x, y);
						if (this.occupation.has(key)) {
							// This should never happen so long as the colspans/rowspans make sense.
							throw new Error(`Cell ${x},${y} already occupied.`);
						}
						this.occupation.set(key, cell);
					}
				}
				if (!this.cellNodes.has(cell)) {
					this.cellNodes.set(cell, {
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
	private getFirstAvailableColumnOnRow(y: number) {
		const columnsOccupied = Array.from(this.occupation.keys())
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
		return this.occupation.get(coord(column, row)) || null;
	}

	public getCellsInRow(row: number) {
		// TODO could be simplified if we knew the table is rectangular
		return (
			Array.from(this.occupation.keys())
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
		const info = this.cellNodes.get(cell);
		if (!info) {
			throw new Error(`The given cell does not exist in this table`);
		}
		return info;
	}
}
