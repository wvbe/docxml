let i = 0;

/**
 * Create a unique not-so-random identifier.
 *
 * @todo maybe make it really random some time.
 */
export function createRandomId() {
	return `random-id-${++i}`;
}

let uniqueNumericIdentifiers = 0;
export function createUniqueNumericIdentifier() {
	return ++uniqueNumericIdentifiers;
}
