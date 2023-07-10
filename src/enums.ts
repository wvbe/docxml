export enum FileLocation {
	contentTypes = '[Content_Types].xml',
	relationships = '_rels/.rels',

	// All other bundle file names are determined by _rels/.rels. What follows are some
	// sensible/conventional defaults:

	comments = 'word/comments.xml',
	coreProperties = 'docProps/core.xml',
	mainDocument = 'word/document.xml',
	numbering = 'word/numbering.xml',
	settings = 'word/settings.xml',
	styles = 'word/styles.xml',
}

export enum FileMime {
	// Extension defaults
	rels = 'application/vnd.openxmlformats-package.relationships+xml',
	xml = 'application/xml',

	// Overrides
	coreProperties = 'application/vnd.openxmlformats-package.core-properties+xml',
	customProperties = 'application/vnd.openxmlformats-officedocument.custom-properties+xml',
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
	comments = 'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml',
	numbering = 'application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml',

	// Binary content types
	jpeg = 'image/jpeg',
	png = 'image/png',
	gif = 'image/gif',
}

export enum RelationshipType {
	commentIds = 'http://schemas.microsoft.com/office/2016/09/relationships/commentsIds',
	comments = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
	commentsExtended = 'http://schemas.microsoft.com/office/2011/relationships/commentsExtended',
	coreProperties = 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
	customProperties = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties',
	customXml = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml',
	endnotes = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes',
	extendedProperties = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
	fontTable = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',
	footer = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
	footnotes = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes',
	header = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
	image = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
	numbering = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
	officeDocument = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
	people = 'http://schemas.microsoft.com/office/2011/relationships/people',
	settings = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
	styles = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
	theme = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
	webSettings = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
	hyperlink = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
	attachedTemplate = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate',
}
