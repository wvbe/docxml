import { DocxComponent, DocxNode } from '../types.ts';

type JsxPragma<
	Props extends { children: unknown[] } = { children: unknown[] },
	Return extends DocxNode = DocxNode,
> = (
	docxComponent: DocxComponent<Props>,
	props: Props,
	...children: Props['children']
) => Return | Promise<Return> | Array<Return> | Promise<Array<Return>>;

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
	return docxComponent({
		...props,
		children: await asArray(children),
	}) as unknown as DocxNode<string>;
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

/**
 * If you're using the DOCX AST nodes right (eg. don't put a `docx.TextRun` inside `docx.TextRun`),
 * then this function does nothing.
 *
 * Otherwise, it will filter out the children that are not valid, and return an array with
 * them and the original element (but possibly split up).
 *
 * For example;
 * ```tsx
 * <Text>This <Text bold>nesting</Text> is illegal</Text>
 * ```
 *
 * Should return instead;
 * ```tsx
 * <>
 *   <Text>This </Text>
 *   <Text bold>nesting</Text>
 *   <Text> is illegal</Text>
 * </>
 * ```
 */
export async function guardAgainstInvalidChildren<
	ValidChild extends DocxNode = DocxNode,
	Self extends DocxNode = DocxNode,
>(
	children: (DocxNode | string)[],
	allowedChildTypes: string[],
	factory: (children: ValidChild[]) => Self | Promise<Self>,
	isRoot?: boolean,
): Promise<(Self | DocxNode)[]> {
	const flattenedChildren = await asArray(children);
	const validGroup: ValidChild[] = [];
	const accumulated: DocxNode[] = [];
	await Promise.all(
		flattenedChildren.map(async (child) => {
			if (allowedChildTypes.includes(child.type)) {
				validGroup.push(child as unknown as ValidChild);
			} else {
				if (isRoot) {
					throw new Error(`Child of type "${child.type}" is not compatible with this parent.`);
				}
				if (validGroup.length) {
					// Closing up a valid group, and empty it out
					accumulated.push(await factory(validGroup));
					validGroup.splice(0, validGroup.length);
				}
				accumulated.push(child);
			}
		}),
	);
	if (!flattenedChildren.length || validGroup.length) {
		accumulated.push(await factory(validGroup));
	}
	return accumulated;
}
