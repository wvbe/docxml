import type { Application } from '../classes/application.ts';
import { Text } from '../components/texts.ts';
import type { AstComponent, AstComponentProps, AstNode, DocxFactoryYield } from '../types.ts';

/**
 * This is the JSX pragma used to transform a hierarchy of AstComponents to the AST that is
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
export async function JSX<C extends AstComponent<AstNode>>(
	component: C,
	props: Omit<C extends AstComponent<infer N> ? AstComponentProps<N> : never, 'children'>,
	...children: (string | AstNode)[]
) {
	await component({
		...props,
		children: await ensureFlatResolvedArray(children),
	});

	return {
		component,
		style: props?.style || null,
		props: props || {},
		children: await ensureFlatResolvedArray(children),
	} as AstNode;
}

export async function getDocxTree<
	NodeGeneric extends AstNode,
	PropsGeneric extends { [key: string]: unknown },
>(
	astNode: NodeGeneric,
	application: Application<PropsGeneric>,
): Promise<DocxFactoryYield<NodeGeneric>> {
	const result = await (async function recurse<N extends AstNode>(
		astNode: string | N,
	): Promise<unknown> {
		if (typeof astNode === 'string') {
			return astNode;
		}
		return astNode.component.toDocx(
			{
				...astNode.props,
				children: await Promise.all(astNode.children.map(recurse)),
			},
			// Fuck TypeScript sometimes.
			application as unknown as Application<{ [key: string]: never }>,
		);
	})(astNode);

	return result as DocxFactoryYield<NodeGeneric>;
}

type MultiDimensionalArray<P> = Array<P | MultiDimensionalArray<P>>;

/**
 * A helper function that ensures that an array-ish (like JSX children, which could be undefined, a single item or an
 * array of items, or a promise thereof, or all of the aforementioned nested in more arrays) is always a single flat array.
 */
export async function ensureFlatResolvedArray<P>(
	children: P | MultiDimensionalArray<P> | undefined,
) {
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

/**
 * @note Modifies by reference!
 */
function inheritProperties(parent: AstNode, child: string | AstNode): string | AstNode {
	if (typeof child === 'string') {
		// No inheritance, although we may see this string again wrapped in a TextNode;
	} else if (parent.component.type === 'Text' && child.component.type === 'Text') {
		child.props = { ...parent.props, ...child.props };
	}
	return child;
}

/**
 * @note Modifies by reference!
 * @todo Not modify by reference
 */
export async function bumpInvalidChildrenToAncestry<N extends AstNode>(node: N): Promise<N> {
	const documentElements = [node];

	async function recurseWalkFromNode(node: AstNode) {
		if (node.children) {
			await walk(node.children);
		}
		if (node.component.type === 'Document' && node.props.footnotes) {
			await Promise.all(
				Object.values(node.props.footnotes as Record<number, AstNode[]>).map((list) => walk(list)),
			);
		}
	}

	async function walk(nodes: (string | AstNode)[]) {
		for (let y = 0; y < nodes.length; y++) {
			const node = nodes[y];
			if (typeof node === 'string') {
				// TODO handle mixed content
				continue;
			}
			await recurseWalkFromNode(node);
			for (let i = 0; i < node.children.length; i++) {
				let child = node.children[i];

				if (typeof child === 'string' && !node.component.mixed && !!child) {
					// If the child is an unexpected string, wrap it in <Text> to attempt to make valid
					child = await JSX(Text, {}, child);
					inheritProperties(node, child);
					node.children.splice(i, 1, child);
				}

				if (
					(typeof child === 'string' && !node.component.mixed) ||
					(typeof child !== 'string' && !node.component.children.includes(child.component.type))
				) {
					const children = node.children
						.splice(i, 1)
						.map((child) => inheritProperties(node, child));

					// If the child is invalid here, split the parent and move it to the middle
					nodes.splice(nodes.indexOf(node) + 1, 0, ...children, {
						...node,
						children: node.children.splice(i, node.children.length - i),
					});

					// Clean up empty text nodes because they are noisy
					nodes
						.filter(
							(node): node is AstNode =>
								typeof node !== 'string' && node.component.type === 'Text' && !node.children.length,
						)
						.forEach((node) => nodes.splice(nodes.indexOf(node), 1));
				}
			}
		}
	}

	await walk(documentElements);

	if (documentElements.length !== 1) {
		throw new Error('DXE030: Some AST nodes could not be given a valid position.');
	}

	return documentElements[0];
}

export default JSX;
