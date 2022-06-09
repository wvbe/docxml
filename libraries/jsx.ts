import { asArray } from './component-utilities.ts';
import { DocxComponent, DocxNode } from './types.ts';

type JsxPragma<
	Props extends { children: unknown[] } = { children: unknown[] },
	Return extends DocxNode<string, unknown> = DocxNode<string, unknown>,
> = (
	Component: DocxComponent<Props, Return>,
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
 * import API, { JSX, Document, Paragraph, Section, Text } from '../../mod.ts';
 *
 * await API.writeAstToDocx(
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

export default JSX;
