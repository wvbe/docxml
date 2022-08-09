import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

export type ChangeInformation = {
	id: number;
	author: string;
	date: Date;
};

/**
 * Parses common change tracking information from a given node.
 *
 * For convenience the node is "optional", in the sense that TS will not complain when passing in
 * the result of a query (which may or may not be strictly a node). If no node is passed, the
 * function will throw. Only use this function if you're already certain you have a change tracking
 * node.
 */
export function getChangeInformation(node?: Node | null) {
	if (!node) {
		throw new Error(`Unexpectedly missing node with change information.`);
	}
	const props = evaluateXPathToMap(
		`
			map {
				"id": ./@${QNS.w}id/number(),
				"author": ./@${QNS.w}author/string(),
				"date": ./@${QNS.w}date/string()
			}
		`,
		node,
	);

	return {
		...props,
		date: new Date(props.date),
	} as ChangeInformation;
}
