export function checkForForbiddenParameters<ObjectToCheck>(
	objectToCheck: ObjectToCheck,
	callback: (object: unknown) => boolean,
	callbackFailureValue: boolean,
): void {
	const values: unknown[] = [];
	// Recurse through an object and flatten it to key-value pairs.
	const flattenedObject = (deepObject: unknown, accumulator: unknown[]) => {
		if (typeof deepObject === 'object') {
			for (const key in deepObject) {
				if (typeof deepObject[key as keyof unknown] === 'object') {
					flattenedObject(deepObject[key as keyof unknown], accumulator);
				} else {
					accumulator.push(deepObject[key as keyof unknown]);
				}
			}
		}
		return accumulator;
	};

	// Iterate over an object's values until we hit one that causes the  callback
	// function to equal the failure value.
	flattenedObject(objectToCheck, values).forEach((value) => {
		if (callback(value) === callbackFailureValue) {
			throw new Error("BAD!");
		}
	});
}
