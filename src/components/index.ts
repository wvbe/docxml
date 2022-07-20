import { evaluateXPathToNodes } from '../util/xquery.ts';
import { Break } from './Break.ts';
import { TextAddition, TextDeletion } from './changes.ts';
import { Paragraph } from './Paragraph.ts';
import { Text } from './Text.ts';

export function castNodesToComponents<P>(nodes: Node[]): P[];
export function castNodesToComponents<P>(query: Node[] | string, node?: Node): P[];
export function castNodesToComponents<P>(nodesOrQuery: Node[] | string, node?: Node): P[] {
	if (!Array.isArray(nodesOrQuery) && !node) {
		throw new Error('castNodesToComponents requires a context node when passing a query');
	}
	const nodes = Array.isArray(nodesOrQuery)
		? nodesOrQuery
		: evaluateXPathToNodes(nodesOrQuery, node);
	return nodes.map(castNodeToComponent).filter(Boolean) as unknown as P[];
}

export function castNodeToComponent(node: Node) {
	if (node.nodeType === 3) {
		// Node is a text node
		return node.nodeValue;
	}
	switch (node.nodeName) {
		case 'w:p':
			return Paragraph.fromNode(node);
		case 'w:r':
			return Text.fromNode(node);
		case 'w:del':
			return TextDeletion.fromNode(node);
		case 'w:ins':
			return TextAddition.fromNode(node);
		case 'w:br':
			return Break.fromNode(node);
		default:
			return;
	}
}
