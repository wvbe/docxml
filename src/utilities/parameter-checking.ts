/**
 * A function that can be used to test that all the parameters of an object pass
 * a particular test. This can be used to check that no values in an object ar NaN,
 * or could be used to check that values are inside a particular range.
 *
 * @param objectToCheck An object whose parameters we want to validate.
 *
 * @param callback A callback function that we use to check the values of our object.
 * The callback will be used recursively if objectToCheck has nested values.
 *
 * @param callbackFailureValue The boolean value that will indicate a failure of the callback function.
 *
 * @returns An array representing all the parameter values of the object, flattened.
 */

export function checkForForbiddenParameters<ObjectToCheck>(
	objectToCheck: ObjectToCheck,
	callback: (object: unknown) => boolean,
	callbackFailureValue: boolean,
): unknown[] {
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

	// Iterate over an object's values until we hit one that causes the callback
	// function to equal the failure value.
	const flattenedObjectArray = flattenedObject(objectToCheck, values);
	return flattenedObjectArray.map((value) => {
		if (callback(value)) {
			throw new Error(
				`Error when checking parameters.\nCallback returned ${callback(value)}, but expected callback to return ${callbackFailureValue}.`,
			);
		} else {
			return value;
		}
	});
}
