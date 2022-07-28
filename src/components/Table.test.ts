/** @jsx m.JSX */

import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { Cell, Row, Table } from '../../mod.ts';

describe('Table', () => {
	describe('isRectangular', () => {
		it('Correct simple table', () =>
			expect(
				new Table(
					{},
					new Row({}, new Cell({}), new Cell({}), new Cell({})),
					new Row({}, new Cell({}), new Cell({}), new Cell({})),
				).isRectangular(),
			).toBeTruthy());

		it('Faulty simple table', () =>
			expect(() =>
				new Table(
					{},
					new Row({}, new Cell({}), new Cell({}), new Cell({})),
					new Row({}, new Cell({}), new Cell({})),
				).isRectangular(),
			).toThrow('Row 2 spans 2 grid columns, but expected 3'));

		it('Correct table with a colspan', () =>
			expect(
				new Table(
					{},
					new Row({}, new Cell({}), new Cell({}), new Cell({})),
					new Row({}, new Cell({}), new Cell({ colSpan: 2 })),
					// new Row({}, new Cell({ colSpan: 2 }), new Cell({ colSpan: 1 })),
					// new Row({}, new Cell({ colSpan: 3 })),
				).isRectangular(),
			).toBeTruthy());

		it('Faulty table with a colspan', () =>
			expect(() =>
				new Table(
					{},
					new Row({}, new Cell({}), new Cell({}), new Cell({})),
					new Row({}, new Cell({}), new Cell({ colSpan: 3 })),
				).isRectangular(),
			).toThrow('Row 2 spans 4 grid columns, but expected 3'));

		// @TODO:
		// it('Correct table with a rowspan', () =>
		// 	expect(
		// 		new Table(
		// 			{},
		// 			new Row({}, new Cell({}), new Cell({ rowSpan: 2 }), new Cell({})),
		// 			new Row({}, new Cell({}), new Cell({})),
		// 		).isRectangular(),
		// 	).toBeTruthy());
	});
});

run();
