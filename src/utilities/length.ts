export type UniversalSize = {
	// equals(n: number): boolean;
	pt: number;
	/**
	 * Yes, some sizes in OOXML are defined as English Metric Units (EMU), defined as 1/360,000 of
	 * a centimeter. Why? Because why not.
	 *
	 * There are approximately 914,400 EMUs per inch, 635 EMUs per twip, 6,350 EMUs per half-point,
	 * 12,700 EMUs per point,
	 */
	emu: number;
	hpt: number;
	/**
	 * OOXML uses 20th points sometimes, meaning that the "real" font size is actually 20 times smaller
	 * than what you'd write in XML -- a value of "240" means 12pt in MS Word terms.
	 *
	 * Also known as 1/1440th of an inch.
	 *
	 * Also known as "twips" or ST_TwipsMeasure
	 *   http://www.datypic.com/sc/ooxml/t-w_ST_TwipsMeasure.html
	 */
	twip: number;
	cm: number;
	inch: number;
};

function convertToUnit(points: number): UniversalSize {
	return {
		// equals: (pts: number) => points === pts,
		pt: points,
		emu: points * 12700,
		hpt: points * 2,
		twip: points * 20,
		cm: points * 0.03527777776,
		inch: points * 0.0138889,
	};
}

/**
 * A length in points. Returns an object that converts this unit to any other unit.
 */
export function pt(amount: number) {
	return convertToUnit(amount);
}

/**
 * A length in English metric units. Returns an object that converts this unit to any other unit.
 */
export function emu(amount: number) {
	return convertToUnit(amount / 12700);
}

/**
 * A length in half-points. Returns an object that converts this unit to any other unit.
 */
export function hpt(amount: number) {
	return convertToUnit(amount / 2);
}

/**
 * A length in twentieth-points. Returns an object that converts this unit to any other unit.
 */
export function twip(amount: number) {
	return convertToUnit(amount / 20);
}

/**
 * A length in centimeters. Returns an object that converts this unit to any other unit.
 */
export function cm(amount: number) {
	return convertToUnit(amount / 0.03527777776);
}

/**
 * A length in inches. Returns an object that converts this unit to any other unit.
 */
export function inch(amount: number) {
	return convertToUnit(amount / 0.0138889);
}
