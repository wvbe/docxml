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
			"pageWidth": ./${QNS.w}pgSz/@${QNS.w}w/ooxml:universal-size(., 'twip'),
			"pageHeight": ./${QNS.w}pgSz/@${QNS.w}h/ooxml:universal-size(., 'twip'),
			"pageOrientation": ./${QNS.w}pgSz/@${QNS.w}orient/string()
		}`,
		node,
	);

	return data;
}

export function sectionPropertiesToNode(data: SectionProperties = {}): Node {
	return create(
		`element ${QNS.w}sectPr {
			if (exists($pageWidth) or exists($pageHeight) or $pageOrientation) then element ${QNS.w}pgSz {
				if (exists($pageWidth)) then attribute ${QNS.w}w { $pageWidth('twip') } else (),
				if (exists($pageHeight)) then attribute ${QNS.w}h { $pageHeight('twip') } else (),
				if ($pageOrientation) then attribute ${QNS.w}orient { $pageOrientation } else ()
			} else ()
		}`,
		{
			pageWidth: data.pageWidth || null,
			pageHeight: data.pageHeight || null,
			pageOrientation: data.pageOrientation || null,
		},
	);
}
