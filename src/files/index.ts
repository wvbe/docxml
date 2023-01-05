import { Archive } from '../classes/Archive.ts';
import { UnhandledXmlFile } from '../classes/XmlFile.ts';
import { Comments } from './Comments.ts';
import { Footer, Header } from './HeaderFooter.ts';
import { Numbering } from './Numbering.ts';
import { OfficeDocument } from './OfficeDocument.ts';
import { RelationshipMeta, RelationshipType } from './Relationships.ts';
import { Settings } from './Settings.ts';
import { Styles } from './Styles.ts';
import { CoreProperties } from './wip/CoreProperties.ts';
import { Endnotes } from './wip/Endnotes.ts';
import { ExtendedProperties } from './wip/ExtendedProperties.ts';
import { FontTable } from './wip/FontTable.ts';
import { Footnotes } from './wip/Footnotes.ts';
import { Theme } from './wip/Theme.ts';
import { WebSettings } from './wip/WebSettings.ts';

/**
 * @deprecated This is probably not the best way to instantiate new classes. Should be looking at
 * the content type instead.
 */
export function castRelationshipToClass(
	archive: Archive,
	meta: Pick<RelationshipMeta, 'type' | 'target'>,
) {
	switch (meta.type) {
		case RelationshipType.coreProperties:
			return CoreProperties.fromArchive(archive, meta.target);
		case RelationshipType.endnotes:
			return Endnotes.fromArchive(archive, meta.target);
		case RelationshipType.extendedProperties:
			return ExtendedProperties.fromArchive(archive, meta.target);
		case RelationshipType.fontTable:
			return FontTable.fromArchive(archive, meta.target);
		case RelationshipType.footer:
			return Footer.fromArchive(archive, meta.target);
		case RelationshipType.footnotes:
			return Footnotes.fromArchive(archive, meta.target);
		case RelationshipType.header:
			return Header.fromArchive(archive, meta.target);
		case RelationshipType.officeDocument:
			return OfficeDocument.fromArchive(archive, meta.target);
		case RelationshipType.settings:
			return Settings.fromArchive(archive, meta.target);
		case RelationshipType.styles:
			return Styles.fromArchive(archive, meta.target);
		case RelationshipType.comments:
			return Comments.fromArchive(archive, meta.target);
		case RelationshipType.theme:
			return Theme.fromArchive(archive, meta.target);
		case RelationshipType.webSettings:
			return WebSettings.fromArchive(archive, meta.target);
		case RelationshipType.numbering:
			return Numbering.fromArchive(archive, meta.target);

		case RelationshipType.customXml:
		case RelationshipType.people:
		case RelationshipType.commentIds:
		case RelationshipType.commentsExtended:
		case RelationshipType.customProperties:
			return UnhandledXmlFile.fromArchive(archive, meta.target);

		case RelationshipType.attachedTemplate:
		default:
			// Code intelligence should tell you that `meta.type` is `never` by now:
			throw new Error(`Unhandled relation ship type "${meta.type}"`);
	}
}
