// Top-level API
export { Docx as default } from './src/Docx.ts';

// Classes
export { type AnyComponent as DocxmlComponent } from './src/classes/Component.ts';

// Content components
export {
	BookmarkRangeEnd,
	type BookmarkRangeEndChild,
	type BookmarkRangeEndProps,
} from './src/components/BookmarkRangeEnd.ts';
export {
	BookmarkRangeStart,
	type BookmarkRangeStartChild,
	type BookmarkRangeStartProps,
} from './src/components/BookmarkRangeStart.ts';
export {
	Break,
	type BreakChild,
	type BreakProps,
} from './src/components/Break.ts';
export { Cell, type CellChild, type CellProps } from './src/components/Cell.ts';
export {
	Comment,
	type CommentChild,
	type CommentProps,
} from './src/components/Comment.ts';
export {
	CommentRangeEnd,
	type CommentRangeEndChild,
	type CommentRangeEndProps,
} from './src/components/CommentRangeEnd.ts';
export {
	CommentRangeStart,
	type CommentRangeStartChild,
	type CommentRangeStartProps,
} from './src/components/CommentRangeStart.ts';
export {
	Field,
	type FieldChild,
	type FieldProps,
} from './src/components/Field.ts';
export {
	FieldRangeEnd,
	type FieldRangeEndChild,
	type FieldRangeEndProps,
} from './src/components/FieldRangeEnd.ts';
export {
	FieldRangeInstruction,
	type FieldRangeInstructionChild,
	type FieldRangeInstructionProps,
} from './src/components/FieldRangeInstruction.ts';
export {
	FieldRangeSeparator,
	type FieldRangeSeparatorChild,
	type FieldRangeSeparatorProps,
} from './src/components/FieldRangeSeparator.ts';
export {
	FieldRangeStart,
	type FieldRangeStartChild,
	type FieldRangeStartProps,
} from './src/components/FieldRangeStart.ts';
export {
	FootnoteReference,
	type FootnoteProps,
	type FootnoteReferenceProps,
} from './src/components/FootnoteReference.ts';
export {
	Hyperlink,
	type HyperlinkChild,
	type HyperlinkProps,
} from './src/components/Hyperlink.ts';
export {
	Image,
	type ImageChild,
	type ImageProps,
} from './src/components/Image.ts';
export {
	NonBreakingHyphen,
	type NonBreakingHyphenChild,
	type NonBreakingHyphenProps,
} from './src/components/NonBreakingHyphen.ts';
export {
	Paragraph,
	type ParagraphChild,
	type ParagraphProps,
} from './src/components/Paragraph.ts';
export { Row, type RowChild, type RowProps } from './src/components/Row.ts';
export {
	RowAddition,
	type RowAdditionChild,
	type RowAdditionProps,
} from './src/components/RowAddition.ts';
export {
	RowDeletion,
	type RowDeletionChild,
	type RowDeletionProps,
} from './src/components/RowDeletion.ts';
export {
	Section,
	type SectionChild,
	type SectionProps,
} from './src/components/Section.ts';
export {
	Symbol,
	type SymbolChild,
	type SymbolProps,
} from './src/components/Symbol.ts';
export { Tab, type TabChild, type TabProps } from './src/components/Tab.ts';
export {
	Table,
	type TableChild,
	type TableProps,
} from './src/components/Table.ts';
export { Text, type TextChild, type TextProps } from './src/components/Text.ts';
export {
	TextAddition,
	type TextAdditionChild,
	type TextAdditionProps,
} from './src/components/TextAddition.ts';
export {
	TextDeletion,
	type TextDeletionChild,
	type TextDeletionProps,
} from './src/components/TextDeletion.ts';
export {
	WatermarkText,
	type WatermarkTextChild,
	type WatermarkTextProps,
} from './src/components/WatermarkText.ts';

// Shared properties
export {
	type Border,
	type LineBorderType,
} from './src/properties/shared-properties.ts';

// Utility functions
export { RelationshipType } from './src/enums.ts';
export { hex, int, type Id } from './src/utilities/id.ts';
export { jsx } from './src/utilities/jsx.ts';
export {
	cm,
	emu,
	hpt,
	inch,
	opt,
	pt,
	twip,
	type Length,
} from './src/utilities/length.ts';

// Archive component types
export { type CommentsXml } from './src/files/CommentsXml.ts';
export { type ContentTypesXml } from './src/files/ContentTypesXml.ts';
export {
	CustomPropertyType,
	type CustomPropertiesXml,
} from './src/files/CustomPropertiesXml.ts';
export {
	type DocumentChild,
	type DocumentXml,
} from './src/files/DocumentXml.ts';
export { type FootnotesXml } from './src/files/FootnotesXml.ts';
export {
	type FooterXml,
	type HeaderFooterChild,
	type HeaderXml,
} from './src/files/HeaderFooterXml.ts';
export { type NumberingXml } from './src/files/NumberingXml.ts';
export { type RelationshipsXml } from './src/files/RelationshipsXml.ts';
export { type SettingsXml } from './src/files/SettingsXml.ts';
export { type StylesXml } from './src/files/StylesXml.ts';
