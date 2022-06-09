import docx from 'https://esm.sh/docx@7.3.0';

import { DocxNode } from './types.ts';

type MultiDimensionalArray<P> = Array<P | MultiDimensionalArray<P>>;
/**
 * A helper function that ensures that an array-ish (like JSX children, which could be undefined, a single item or an
 * array of items, or a promise thereof, or all of the aforementioned nested in more arrays) is always a single flat array.
 */
export async function asArray<P>(children: P | MultiDimensionalArray<P> | undefined) {
	const x = await [children]
		.filter((item): item is P | MultiDimensionalArray<P> => item !== undefined && item !== null)
		.reduce<Promise<P[]>>(recursiveFlattenArray, Promise.resolve([]));
	return x;
}

async function recursiveFlattenArray<P>(
	flat: Promise<P[]>,
	item: P | MultiDimensionalArray<P>,
): Promise<P[]> {
	const iitem = await item;
	if (!Array.isArray(iitem)) {
		return [...(await flat), iitem].filter(Boolean);
	}
	return [
		...(await flat),
		...(await iitem.reduce(recursiveFlattenArray, Promise.resolve([] as P[]))),
	];
}

export async function asDocxArray<P>(children?: DocxNode<string, P> | DocxNode<string, P>[]) {
	return (await asArray(children)).map((child) => child.docx);
}
export async function asJsonmlArray<P>(children?: DocxNode<string, P> | DocxNode<string, P>[]) {
	return (await asArray(children)).map((child) => child.jsonml);
}

/**
 * A helper function to check that the children (passed to a DocxComponent) are of an allowed
 * type. If not, the function throws a descriptive error.
 */
export async function assertChildrenAreOnlyOfType<P extends DocxNode<string, unknown>>(
	parentLabel: string,
	children: P | P[] | undefined,
	...allowedTypes: string[]
) {
	const mismatch = (await asArray(children)).find((child) => !allowedTypes.includes(child.type));

	if (mismatch) {
		throw new Error(
			`The <${parentLabel}> component contains an invalid child component of type <${
				mismatch.type
			}>. The only allowed child component types are: ${allowedTypes
				.map((type) => `<${type}>`)
				.join(', ')}.`,
		);
	}
}

/**
 * Write a <Document> to disk as a .docx file.
 */
export default async function writeDocxFile(
	location: string,
	document: docx.Document | Promise<docx.Document>,
) {
	const blob = await docx.Packer.toBlob(await document);
	await Deno.writeFile(location, new Uint8Array(await blob.arrayBuffer()));
}
