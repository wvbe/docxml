import { DocxComponent, DocxNode } from '../types.ts';

type JsxPragma<
	Props extends { children: unknown[] } = { children: unknown[] },
	Return extends DocxNode<string, unknown> = DocxNode<string, unknown>,
> = (
	docxComponent: DocxComponent<Props, Return>,
	props: Props,
	...children: Props['children']
) => Return | Promise<Return>;

/**
 * This is the JSX pragma used to transform a hierarchy of DocxComponents to the AST that is
 * interpreted by the rest of the application. Import it into any file where you would like to
 * use JSX to compose a DOCX document.
 *
 * For example:
 * ```ts
 * /** @jsx Application.JSX * /
 * import Application, { Document, Paragraph, Section, Text } from '../../mod.ts';
 *
 * await Application.writeAstToDocx(
 *     'from-template.docx',
 *     <Document template={template.init()}>
 *         <Section>
 *             <Paragraph>
 *                 <Text>Howdy.</Text>
 *             </Paragraph>
 *         </Section>
 * 	</Document>,
 * );
 * ```
 *
 * This pragma allows you to use single items as a child, arrays, nested arrays, promises of a child
 * or promises of (nested) arrays, etc. Only attributes will be passed on to their component without
 * being awaited.
 */
export const JSX: JsxPragma = async (docxComponent, props, ...children) => {
	const result = await docxComponent({
		...props,
		children: await asArray(children),
	});
	return result;
};

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

export default JSX;
