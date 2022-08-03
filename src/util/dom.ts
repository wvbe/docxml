import {
	evaluateUpdatingExpression,
	executePendingUpdateList,
} from 'https://esm.sh/fontoxpath@3.26.1';
import {
	Document as SlimdomDocument,
	Node as SlimdomNode,
	parseXmlDocument,
	serializeToWellFormedString,
} from 'https://esm.sh/slimdom@4.0.1';

import { evaluateXPathToFirstNode, INodesFactory, XQUERY_3_1_LANGUAGE } from './xquery.ts';

/**
 * All the known namespace URIs by their preferred prefix.
 *
 * @todo Cull the namespaces that are not used anywhere
 */
export const NamespaceUri = {
	aink: 'http://schemas.microsoft.com/office/drawing/2016/ink',
	am3d: 'http://schemas.microsoft.com/office/drawing/2017/model3d',
	cx: 'http://schemas.microsoft.com/office/drawing/2014/chartex',
	cx1: 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
	cx2: 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
	cx3: 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
	cx4: 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
	cx5: 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
	cx6: 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
	cx7: 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
	cx8: 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
	m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
	mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
	o: 'urn:schemas-microsoft-com:office:office',
	oel: 'http://schemas.microsoft.com/office/2019/extlst',
	r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
	v: 'urn:schemas-microsoft-com:vml',
	w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
	w10: 'urn:schemas-microsoft-com:office:word',
	w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
	w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
	w16: 'http://schemas.microsoft.com/office/word/2018/wordml',
	w16cex: 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
	w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
	w16sdtdh: 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
	w16se: 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
	wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
	wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
	wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
	wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
	wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
	wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
	wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',

	// Documents
	relationshipsDocument: 'http://schemas.openxmlformats.org/package/2006/relationships',
	contentTypesDocument: 'http://schemas.openxmlformats.org/package/2006/content-types',
	cp: 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
	dc: 'http://purl.org/dc/elements/1.1/',
	dcterms: 'http://purl.org/dc/terms/',
	dcmitype: 'http://purl.org/dc/dcmitype/',
	xsi: 'http://www.w3.org/2001/XMLSchema-instance',
};

/**
 * A helper object containing the "Q{https://…}" notation of each namespace. Makes writing queries
 * a lot less verbose.
 *
 * For example;
 *   const query = `/${QNS.w}document`;
 *   // "/Q{https://…}document"
 */
export const QNS = Object.keys(NamespaceUri).reduce<Record<keyof typeof NamespaceUri, string>>(
	(map: Record<keyof typeof NamespaceUri, string>, prefix) => ({
		...map,
		[prefix]: `Q{${NamespaceUri[prefix as keyof typeof NamespaceUri]}}`,
	}),
	{} as Record<keyof typeof NamespaceUri, string>,
);

/**
 * Serialize an XML node to string using Slimdom's own serializer function, but with the "standard"
 * typing that Deno has for Node and Document.
 */
export function serialize(node: Node | Document) {
	return serializeToWellFormedString(node as unknown as SlimdomNode);
}

/**
 * Parse an XML string to DOM using Slimdom's own parser function, but with the "standard"
 * typing that Deno has for Node and Document -- so that type matching is not complicated further
 * down the line.
 */
export function parse(xml: string) {
	return parseXmlDocument(xml) as unknown as Document;
}

type UnknownObject = { [key: string]: unknown };

/**
 * Create a new XML DOM node using XQuery.
 */
export function create(query: string, variables?: UnknownObject, asDocument?: false): Node;
/**
 * Create a new XML DOM element using XQuery, and return it as a Document.
 */
export function create(query: string, variables: UnknownObject, asDocument: true): Document;
/**
 * Create a new XML DOM node using XQuery.
 *
 * For example:
 *   const el = create(`<derp>{$nerf}</derp>`, { nerf: 'skeet' });
 *   // Element <derp>skeet</derp>
 */
export function create(
	query: string,
	variables: UnknownObject = {},
	asDocument = false,
): Node | Document {
	const node = evaluateXPathToFirstNode(query, null, null, variables, {
		language: XQUERY_3_1_LANGUAGE,
		nodesFactory: new SlimdomDocument() as unknown as INodesFactory,
	});
	if (!node) {
		throw new Error('Query did not result in a node');
	}
	if (asDocument) {
		const doc = new SlimdomDocument();
		doc.appendChild(node as unknown as SlimdomNode);
		return doc as unknown as Document;
	}
	return node;
}

/**
 * @deprecated This constant may be removed in the future. Use specific namespaces or `QNS` when you can.
 */
export const ALL_NAMESPACE_DECLARATIONS = Object.keys(NamespaceUri)
	.map((prefix) => `xmlns:${prefix}="${NamespaceUri[prefix as keyof typeof NamespaceUri]}"`)
	.join(' ');

/**
 * Run an XQuery Update Facility expression, maybe even repeatedly, which can change an existing DOM.
 *
 * @deprecated Not used anywhere, may be removed in the future
 */
export async function xquf(dom: Node | Document, expression: string, times = 1) {
	while (times-- > 0) {
		executePendingUpdateList(
			(await evaluateUpdatingExpression(expression, dom, null, {}, { debug: true }))
				.pendingUpdateList,
		);
	}
}
