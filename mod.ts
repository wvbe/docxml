/**
 * @file
 * This file exports all the public APIs of the app. The {@link Application} class is the primary
 * configuration API. Please see its methods for more information.
 *
 * The other exports are class and component declarations for further use of the configuration API.
 */

export { Application as default } from './libraries/classes/application.ts';
export * from './libraries/classes/template.dotx.ts';
export * from './libraries/classes/template.empty.ts';
export * from './libraries/components/documents.ts';
export * from './libraries/components/footnotes.ts';
export * from './libraries/components/images.ts';
export * from './libraries/components/paragraphs.ts';
export * from './libraries/components/sections.ts';
export * from './libraries/components/table-cells.ts';
export * from './libraries/components/table-rows.ts';
export * from './libraries/components/tables.ts';
export * from './libraries/components/texts.ts';

/*
 * Re-exporting enums from `docx`
 *
 * @note Picked entirely arbitrarily for now.
 */
import docx from 'https://esm.sh/docx@7.3.0';
export const AlignmentType = docx.AlignmentType;
export const BorderStyle = docx.BorderStyle;
export const HorizontalPositionAlign = docx.HorizontalPositionAlign;
export const NumberFormat = docx.NumberFormat;
export const PageOrientation = docx.PageOrientation;
export const SectionType = docx.SectionType;
export const ShadingType = docx.ShadingType;
export const UnderlineType = docx.UnderlineType;
export const VerticalAlign = docx.VerticalAlign;
export const VerticalPositionAlign = docx.VerticalPositionAlign;
