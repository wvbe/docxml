import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { checkForForbiddenParameters } from './parameter-checking.ts';

describe('Checking for bad object parameters', () => {
	type fakeType = {
		first: string;
		second: number;
		third: boolean;
	};
	type fakeNestedObject = {
		firstParam: string;
		second: number;
		third: fakeType;
		fourth: number;
	};

	const notNumber = NaN;

	const fakeInnerObject: fakeType = {
		first: 'darkness',
		second: 4,
		third: false,
	};

	const fakeOuterObject: fakeNestedObject = {
		firstParam: 'Hello',
		second: 123,
		third: fakeInnerObject,
		fourth: notNumber,
	};

	it('ensure that NaN is caught when used as a parameter of type number', () => {
		const objArray = checkForForbiddenParameters(
			fakeInnerObject,
			(propValue: unknown) => {
				return typeof propValue === 'number' && Number.isNaN(propValue);
			},
			true,
		);
		// Should return the array of the object parameter values.
		expect(objArray.length).toBe(3);
		expect(objArray).toEqual(['darkness', 4, false]);

		expect(
			checkForForbiddenParameters(
				fakeOuterObject,
				(propValue) => {
					return typeof propValue === 'number' && Number.isNaN(propValue);
				},
				true,
			),
		).rejects.toThrow();
	});
});

run();
