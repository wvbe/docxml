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
	/**
	 * A reference to the header portion on every page in this section.
	 */
	headers?: null | string | { first?: string | null; even?: string | null; odd?: string | null };
	/**
	 * A reference to the footer portion on every page in this section.
	 */
	footers?: null | string | { first?: string | null; even?: string | null; odd?: string | null };
	/**
	 * The width of any page in this section.
	 */
	pageWidth?: null | Length;
	/**
	 * The height of any page in this section.
	 */
	pageHeight?: null | Length;
	/**
	 * The supposed orientation noted for pages in this section. Overridden by `.pageWidth` or `.pageHeight`
	 * when they are set.
	 */
	pageOrientation?: null | 'landscape' | 'portrait';

	/**
	 * The space between content and various other boundaries in the page layout.
	 */
	pageMargin?: {
		top?: null | Length;
		right?: null | Length;
		bottom?: null | Length;
		left?: null | Length;
		header?: null | Length;
		footer?: null | Length;
		gutter?: null | Length;
	};

	/**
	 * Specifies whether sections in the document shall have different headers and footers for even and odd pages.
	 */
	titlePage?: null | boolean;
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
			"pageWidth": docxml:length(${QNS.w}pgSz/@${QNS.w}w, 'twip'),
			"pageHeight": docxml:length(${QNS.w}pgSz/@${QNS.w}h, 'twip'),
			"pageOrientation": ./${QNS.w}pgSz/@${QNS.w}orient/string(),
			"pageMargin": map {
				"top": docxml:length(./${QNS.w}pgMar/@${QNS.w}top, 'twip'),
				"right": docxml:length(./${QNS.w}pgMar/@${QNS.w}right, 'twip'),
				"bottom": docxml:length(./${QNS.w}pgMar/@${QNS.w}bottom, 'twip'),
				"left": docxml:length(./${QNS.w}pgMar/@${QNS.w}left, 'twip'),
				"header": docxml:length(./${QNS.w}pgMar/@${QNS.w}header, 'twip'),
				"footer": docxml:length(./${QNS.w}pgMar/@${QNS.w}footer, 'twip'),
				"gutter": docxml:length(./${QNS.w}pgMar/@${QNS.w}gutter, 'twip')
			},
			"titlePage": exists(./${QNS.w}titlePg) and (not(./${QNS.w}titlePg/@${QNS.w}val) or docxml:st-on-off(./${QNS.w}titlePg/@${QNS.w}val))
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
			} else (),
			if (exists($pageMargin)) then element ${QNS.w}pgMar {
				if (exists($pageMargin('top'))) then attribute ${QNS.w}top { $pageMargin('top')('twip') } else (),
				if (exists($pageMargin('right'))) then attribute ${QNS.w}right { $pageMargin('right')('twip') } else (),
				if (exists($pageMargin('bottom'))) then attribute ${QNS.w}bottom { $pageMargin('bottom')('twip') } else (),
				if (exists($pageMargin('left'))) then attribute ${QNS.w}left { $pageMargin('left')('twip') } else (),
				if (exists($pageMargin('header'))) then attribute ${QNS.w}header { $pageMargin('header')('twip') } else (),
				if (exists($pageMargin('footer'))) then attribute ${QNS.w}footer { $pageMargin('footer')('twip') } else (),
				if (exists($pageMargin('gutter'))) then attribute ${QNS.w}gutter { $pageMargin('gutter')('twip') } else ()
			} else (),
			if(exists($titlePage)) then element ${QNS.w}titlePg { attribute ${QNS.w}val { "1" } } else ()
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
			pageMargin: data.pageMargin || null,
			pageOrientation: data.pageOrientation || null,
			titlePage: data.titlePage || null
		},
	);
}
