// Top-level API
export { Docx as default } from './src/Docx.ts';

// Content components
export { BookmarkRangeEnd } from './src/components/BookmarkRangeEnd.ts';
export { BookmarkRangeStart } from './src/components/BookmarkRangeStart.ts';
export { type BreakChild, type BreakProps, Break } from './src/components/Break.ts';
export { type CellChild, type CellProps, Cell } from './src/components/Cell.ts';
export { Comment } from './src/components/Comment.ts';
export { CommentRangeEnd } from './src/components/CommentRangeEnd.ts';
export { CommentRangeStart } from './src/components/CommentRangeStart.ts';
export { type HyperlinkChild, type HyperlinkProps, Hyperlink } from './src/components/Hyperlink.ts';
export { type ImageChild, type ImageProps, Image } from './src/components/Image.ts';
export { type ParagraphChild, type ParagraphProps, Paragraph } from './src/components/Paragraph.ts';
export { type RowChild, type RowProps, Row } from './src/components/Row.ts';
export {
	type RowAdditionChild,
	type RowAdditionProps,
	RowAddition,
} from './src/components/RowAddition.ts';
export {
	type RowDeletionChild,
	type RowDeletionProps,
	RowDeletion,
} from './src/components/RowDeletion.ts';
export { type SectionChild, type SectionProps, Section } from './src/components/Section.ts';
export { type TableChild, type TableProps, Table } from './src/components/Table.ts';
export { type TextChild, type TextProps, Text } from './src/components/Text.ts';
export {
	type TextAdditionChild,
	type TextAdditionProps,
	TextAddition,
} from './src/components/TextAddition.ts';
export {
	type TextDeletionChild,
	type TextDeletionProps,
	TextDeletion,
} from './src/components/TextDeletion.ts';

// Utility functions
export { jsx } from './src/utilities/jsx.ts';
export { type Length, cm, emu, hpt, inch, opt, pt, twip } from './src/utilities/length.ts';

// Archive component types
export { type Comments as DocxComments } from './src/files/Comments.ts';
export { type ContentTypes as DocxContentTypes } from './src/files/ContentTypes.ts';
export { type OfficeDocument as DocxDocument } from './src/files/OfficeDocument.ts';
export { type Relationships as DocxRelationships } from './src/files/Relationships.ts';
export { type Settings as DocxSettings } from './src/files/Settings.ts';
export { type Styles as DocxStyles } from './src/files/Styles.ts';
