import { ContentTypesXml } from '../../mod.ts';
import { Archive } from '../classes/Archive.ts';
import { UnhandledXmlFile } from '../classes/XmlFile.ts';
import { RelationshipType } from '../enums.ts';
import { CommentsXml } from './CommentsXml.ts';
import { CustomPropertiesXml } from './CustomPropertiesXml.ts';
import { DocumentXml } from './DocumentXml.ts';
import { FooterXml, HeaderXml } from './HeaderFooterXml.ts';
import { NumberingXml } from './NumberingXml.ts';
import { RelationshipMeta } from './RelationshipsXml.ts';
import { SettingsXml } from './SettingsXml.ts';
import { StylesXml } from './StylesXml.ts';
import { CorePropertiesXml } from './wip/CorePropertiesXml.ts';
import { EndnotesXml } from './wip/EndnotesXml.ts';
import { ExtendedPropertiesXml } from './wip/ExtendedPropertiesXml.ts';
import { FontTableXml } from './wip/FontTableXml.ts';
import { FootnotesXml } from './wip/FootnotesXml.ts';
import { ThemeXml } from './wip/ThemeXml.ts';
import { WebSettingsXml } from './wip/WebSettingsXml.ts';

/**
 * @deprecated This is probably not the best way to instantiate new classes. Should be looking at
 * the content type instead.
 */
export function castRelationshipToClass(
	archive: Archive,
	contentTypes: ContentTypesXml,
	meta: Pick<RelationshipMeta, 'type' | 'target'>,
) {
	switch (meta.type) {
		case RelationshipType.customProperties:
			return CustomPropertiesXml.fromArchive(archive, meta.target);
		case RelationshipType.coreProperties:
			return CorePropertiesXml.fromArchive(archive, meta.target);
		case RelationshipType.endnotes:
			return EndnotesXml.fromArchive(archive, meta.target);
		case RelationshipType.extendedProperties:
			return ExtendedPropertiesXml.fromArchive(archive, meta.target);
		case RelationshipType.fontTable:
			return FontTableXml.fromArchive(archive, meta.target);
		case RelationshipType.footer:
			return FooterXml.fromArchive(archive, contentTypes, meta.target);
		case RelationshipType.footnotes:
			return FootnotesXml.fromArchive(archive, meta.target);
		case RelationshipType.header:
			return HeaderXml.fromArchive(archive, contentTypes, meta.target);
		case RelationshipType.officeDocument:
			return DocumentXml.fromArchive(archive, contentTypes, meta.target);
		case RelationshipType.settings:
			return SettingsXml.fromArchive(archive, contentTypes, meta.target);
		case RelationshipType.styles:
			return StylesXml.fromArchive(archive, meta.target);
		case RelationshipType.comments:
			return CommentsXml.fromArchive(archive, contentTypes, meta.target);
		case RelationshipType.theme:
			return ThemeXml.fromArchive(archive, meta.target);
		case RelationshipType.webSettings:
			return WebSettingsXml.fromArchive(archive, meta.target);
		case RelationshipType.numbering:
			return NumberingXml.fromArchive(archive, meta.target);

		case RelationshipType.customXml:
		case RelationshipType.people:
		case RelationshipType.commentIds:
		case RelationshipType.commentsExtended:
		case RelationshipType.classificationlabels:
		case RelationshipType.downRev:
		case RelationshipType.graphicFrameDoc:
			return UnhandledXmlFile.fromArchive(archive, meta.target);

		case RelationshipType.attachedTemplate:
		default:
			// Code intelligence should tell you that `meta.type` is `never` by now:
			throw new Error(`Unhandled relation ship type "${meta.type}"`);
	}
}
