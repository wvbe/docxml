/**
 * @file
 * Proxies most of the fontoxpath methods and fixes some of the typing around it. Also, XPath errors
 * will no longer have a stack trace pointing to the (minified) fontoxpath internals, but instead
 * tell you where the query was run from.
 */
// Import the file that registers custom XPath functions to the fontoxpath global;
import {
	evaluateXPath as _evaluateXPath,
	evaluateXPathToArray as _evaluateXPathToArray,
	evaluateXPathToBoolean as _evaluateXPathToBoolean,
	evaluateXPathToFirstNode as _evaluateXPathToFirstNode,
	evaluateXPathToMap as _evaluateXPathToMap,
	evaluateXPathToNodes as _evaluateXPathToNodes,
	evaluateXPathToNumber as _evaluateXPathToNumber,
	evaluateXPathToString as _evaluateXPathToString,
} from 'https://esm.sh/fontoxpath@3.27.1?pin=v96';

import { PIZZA_SPACE } from './xquery-functions.ts';

export type { INodesFactory } from 'https://esm.sh/fontoxpath@3.27.1?pin=v96';

export const XQUERY_3_1_LANGUAGE = _evaluateXPath.XQUERY_3_1_LANGUAGE;

const OPTIONS = {
	language: XQUERY_3_1_LANGUAGE,
	moduleImports: {
		ooxml: PIZZA_SPACE,
	},
};

export function evaluateXPath(
	...[query, node, domFacade, variables, returnType, options]: Parameters<typeof _evaluateXPath>
) {
	try {
		return _evaluateXPath(query, node, domFacade, variables, returnType, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToArray(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToArray>
) {
	try {
		return _evaluateXPathToArray(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToMap<P = Record<string, unknown>>(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToMap>
) {
	try {
		return _evaluateXPathToMap(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		}) as P;
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToFirstNode(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToFirstNode>
) {
	try {
		return _evaluateXPathToFirstNode<Node>(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).stack);
	}
}

export function evaluateXPathToNodes(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToNodes>
) {
	try {
		return _evaluateXPathToNodes<Node>(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToBoolean(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToBoolean>
) {
	try {
		return _evaluateXPathToBoolean(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToNumber(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToNumber>
) {
	try {
		return _evaluateXPathToNumber(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}

export function evaluateXPathToString(
	...[query, node, domFacade, variables, options]: Parameters<typeof _evaluateXPathToString>
) {
	try {
		return _evaluateXPathToString(query, node, domFacade, variables, {
			...(options || {}),
			...OPTIONS,
		});
	} catch (error: unknown) {
		// Rethrow because we're not interested in the fontoxpath stack itself.
		throw new Error((error as Error).message);
	}
}
