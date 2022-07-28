export enum BundleFile {
	contentTypes = '[Content_Types].xml',
	relationships = '_rels/.rels',

	// All other bundle file names are determined by _rels/.rels. What follows are some
	// sensible/conventional defaults:

	coreProperties = 'docProps/core.xml',
	mainDocument = 'word/document.xml',
	styles = 'word/styles.xml',
}

export enum ContentType {
	// Extension defaults
	rels = 'application/vnd.openxmlformats-package.relationships+xml',
	xml = 'application/xml',

	// Overrides
	coreProperties = 'application/vnd.openxmlformats-package.core-properties+xml',
	endnotes = 'application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml',
	extendedProperties = 'application/vnd.openxmlformats-officedocument.extended-properties+xml',
	fontTable = 'application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml',
	footer = 'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml',
	footnotes = 'application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml',
	header = 'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml',
	mainDocument = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
	relationships = 'application/vnd.openxmlformats-package.relationships+xml',
	settings = 'application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml',
	styles = 'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml',
	theme = 'application/vnd.openxmlformats-officedocument.theme+xml',
	webSettings = 'application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml',
}

/**
 * Half of 1pt
 *
 * eg. "28" means 14pt
 */
export type HalfPoint = number;

/**
 * 1/8th of 1pt
 */
export type EightPoint = number;

/**
 * OOXML uses 20th points sometimes, meaning that the "real" font size is actually 20 times smaller
 * than what you'd write in XML -- a value of "240" means 12pt in MS Word terms.
 *
 * Also known as 1/1440th of an inch.
 *
 * Also known as "twips" or ST_TwipsMeasure
 *   http://www.datypic.com/sc/ooxml/t-w_ST_TwipsMeasure.html
 */
export type TwentiethPoint = number;
