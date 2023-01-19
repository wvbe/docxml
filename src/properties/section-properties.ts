import { create } from '../utilities/dom.ts';
import { Length } from '../utilities/length.ts';
import { QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

/**
 * All the formatting options that can be given on a text run (inline text).
 *
 * Serializes to the <w:rPr> element.
 *   https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_rPr_topic_ID0EIEKM.html
 */
export type SectionProperties = {
	headers?: null | string | { first?: string | null; even?: string | null; odd?: string | null };
	footers?: null | string | { first?: string | null; even?: string | null; odd?: string | null };
	pageWidth?: null | Length;
	pageHeight?: null | Length;
	pageOrientation?: null | 'landscape' | 'portrait';
};

export function sectionPropertiesFromNode(node?: Node | null): SectionProperties {
	if (!node) {
		return {};
	}
	const data = evaluateXPathToMap<SectionProperties>(
		`map {
			"headers": map {
				"first": ./${QNS.w}headerReference[@${QNS.w}type = 'first']/@${QNS.r}id/string(),
				"even": ./${QNS.w}headerReference[@${QNS.w}type = 'even']/@${QNS.r}id/string(),
				"odd": ./${QNS.w}headerReference[@${QNS.w}type = 'default']/@${QNS.r}id/string()
			},
			"footers": map {
				"first": ./${QNS.w}footerReference[@${QNS.w}type = 'first']/@${QNS.r}id/string(),
				"even": ./${QNS.w}footerReference[@${QNS.w}type = 'even']/@${QNS.r}id/string(),
				"odd": ./${QNS.w}footerReference[@${QNS.w}type = 'default']/@${QNS.r}id/string()
			},
			"pageWidth": ./${QNS.w}pgSz/@${QNS.w}w/docxml:length(., 'twip'),
			"pageHeight": ./${QNS.w}pgSz/@${QNS.w}h/docxml:length(., 'twip'),
			"pageOrientation": ./${QNS.w}pgSz/@${QNS.w}orient/string()
		}`,
		node,
	);

	return data;
}

export function sectionPropertiesToNode(data: SectionProperties = {}): Node {
	return create(
		`element ${QNS.w}sectPr {
			if (exists($headers('first'))) then element ${QNS.w}headerReference {
				attribute ${QNS.r}id { $headers('first') },
				attribute ${QNS.w}type { 'first' }
			} else (),
			if (exists($headers('even'))) then element ${QNS.w}headerReference {
				attribute ${QNS.r}id { $headers('even') },
				attribute ${QNS.w}type { 'even' }
			} else (),
			if (exists($headers('odd'))) then element ${QNS.w}headerReference {
				attribute ${QNS.r}id { $headers('odd') },
				attribute ${QNS.w}type { 'default' }
			} else (),
			if (exists($footers('first'))) then element ${QNS.w}footerReference {
				attribute ${QNS.r}id { $footers('first') },
				attribute ${QNS.w}type { 'first' }
			} else (),
			if (exists($footers('even'))) then element ${QNS.w}footerReference {
				attribute ${QNS.r}id { $footers('even') },
				attribute ${QNS.w}type { 'even' }
			} else (),
			if (exists($footers('odd'))) then element ${QNS.w}footerReference {
				attribute ${QNS.r}id { $footers('odd') },
				attribute ${QNS.w}type { 'default' }
			} else (),
			if (exists($pageWidth) or exists($pageHeight) or $pageOrientation) then element ${QNS.w}pgSz {
				if (exists($pageWidth)) then attribute ${QNS.w}w { $pageWidth('twip') } else (),
				if (exists($pageHeight)) then attribute ${QNS.w}h { $pageHeight('twip') } else (),
				if ($pageOrientation) then attribute ${QNS.w}orient { $pageOrientation } else ()
			} else ()
		}`,
		{
			headers:
				typeof data.headers === 'string'
					? { first: data.headers, even: data.headers, odd: data.headers }
					: data.headers || {},
			footers:
				typeof data.footers === 'string'
					? { first: data.footers, even: data.footers, odd: data.footers }
					: data.footers || {},
			pageWidth: data.pageWidth || null,
			pageHeight: data.pageHeight || null,
			pageOrientation: data.pageOrientation || null,
		},
	);
}
