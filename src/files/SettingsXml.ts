import * as path from 'https://deno.land/std@0.187.0/path/mod.ts';

import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime, RelationshipType } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';
import { File, RelationshipsXml } from './RelationshipsXml.ts';

/**
 * All the settings accepted into a DOCX via `settings.xml`
 */
export type SettingsI = {
	activeWritingStyle: unknown;
	alignBordersAndEdges: unknown;
	alwaysMergeEmptyNamespace: unknown;
	alwaysShowPlaceholderText: unknown;
	attachedSchema: unknown;
	attachedTemplate: string | null;
	autoFormatOverride: unknown;
	autoHyphenation: unknown;
	bookFoldPrinting: unknown;
	bookFoldPrintingSheets: unknown;
	bookFoldRevPrinting: unknown;
	bordersDoNotSurroundFooter: unknown;
	bordersDoNotSurroundHeader: unknown;
	captions: unknown;
	characterSpacingControl: unknown;
	clickAndTypeStyle: unknown;
	clrSchemeMapping: unknown;
	compat: unknown;
	consecutiveHyphenLimit: unknown;
	decimalSymbol: unknown;
	defaultTableStyle: unknown;
	defaultTabStop: unknown;
	displayBackgroundShape: boolean;
	displayHorizontalDrawingGridEvery: unknown;
	displayVerticalDrawingGridEvery: unknown;
	documentProtection: unknown;
	documentType: unknown;
	docVars: unknown;
	doNotAutoCompressPictures: unknown;
	doNotDemarcateInvalidXml: unknown;
	doNotEmbedSmartTags: unknown;
	doNotHyphenateCaps: unknown;
	doNotIncludeSubdocsInStats: unknown;
	doNotShadeFormData: unknown;
	doNotTrackFormatting: unknown;
	doNotTrackMoves: unknown;
	doNotUseMarginsForDrawingGridOrigin: unknown;
	doNotValidateAgainstSchema: unknown;
	drawingGridHorizontalOrigin: unknown;
	drawingGridHorizontalSpacing: unknown;
	drawingGridVerticalOrigin: unknown;
	drawingGridVerticalSpacing: unknown;
	embedSystemFonts: boolean;
	embedTrueTypeFonts: boolean;
	endnotePr: unknown;
	/**
	 * When set to `true`, the file will use different headers between odd and even pages, or leave them
	 * empty. When set to `false`, odd and even pages will get the same header (the one set for "odd").
	 *
	 * Defaults to `false`
	 */
	evenAndOddHeaders: boolean;
	footnotePr: unknown;
	forceUpgrade: unknown;
	formsDesign: unknown;
	gutterAtTop: unknown;
	hdrShapeDefaults: unknown;
	hideGrammaticalErrors: unknown;
	hidePageBoundaries: boolean;
	hideSpellingErrors: unknown;
	hyphenationZone: unknown;
	ignoreMixedContent: unknown;
	linkStyles: unknown;
	listSeparator: unknown;
	mailMerge: unknown;
	mirrorMargins: boolean;
	noLineBreaksAfter: unknown;
	noLineBreaksBefore: unknown;
	noPunctuationKerning: unknown;
	printFormsData: boolean;
	printFractionalCharacterWidth: boolean;
	printPostScriptOverText: boolean;
	printTwoOnOne: unknown;
	proofState: unknown;
	readModeInkLockDown: unknown;
	removeDateAndTime: boolean;
	removePersonalInformation: boolean;
	revisionView: unknown;
	rsids: unknown;
	saveFormsData: boolean;
	saveInvalidXml: unknown;
	savePreviewPicture: unknown;
	saveSubsetFonts: boolean;
	saveThroughXslt: unknown;
	saveXmlDataOnly: unknown;
	shapeDefaults: unknown;
	showEnvelope: unknown;
	showXMLTags: unknown;
	smartTagType: unknown;
	strictFirstAndLastChars: unknown;
	styleLockQFSet: unknown;
	styleLockTheme: unknown;
	stylePaneFormatFilter: unknown;
	stylePaneSortMethod: unknown;
	summaryLength: unknown;
	themeFontLang: unknown;
	trackRevisions: boolean;
	updateFields: unknown;
	useXSLTWhenSaving: unknown;
	/**
	 * The type of view that a text processor should display the document with.
	 */
	view: 'print' | 'outline' | 'masterPages' | 'normal' | 'web' | null;
	writeProtection: string | null;
	zoom: 'fullPage' | 'bestFit' | 'textFit' | number | null;
};

const DEFAULT_SETTINGS: SettingsI = {
	activeWritingStyle: null,
	alignBordersAndEdges: null,
	alwaysMergeEmptyNamespace: null,
	alwaysShowPlaceholderText: null,
	attachedSchema: null,
	attachedTemplate: null,
	autoFormatOverride: null,
	autoHyphenation: null,
	bookFoldPrinting: null,
	bookFoldPrintingSheets: null,
	bookFoldRevPrinting: null,
	bordersDoNotSurroundFooter: null,
	bordersDoNotSurroundHeader: null,
	captions: null,
	characterSpacingControl: null,
	clickAndTypeStyle: null,
	clrSchemeMapping: null,
	compat: null,
	consecutiveHyphenLimit: null,
	decimalSymbol: null,
	defaultTableStyle: null,
	defaultTabStop: null,
	displayBackgroundShape: false,
	displayHorizontalDrawingGridEvery: null,
	displayVerticalDrawingGridEvery: null,
	documentProtection: null,
	documentType: null,
	docVars: null,
	doNotAutoCompressPictures: null,
	doNotDemarcateInvalidXml: null,
	doNotEmbedSmartTags: null,
	doNotHyphenateCaps: null,
	doNotIncludeSubdocsInStats: null,
	doNotShadeFormData: null,
	doNotTrackFormatting: null,
	doNotTrackMoves: null,
	doNotUseMarginsForDrawingGridOrigin: null,
	doNotValidateAgainstSchema: null,
	drawingGridHorizontalOrigin: null,
	drawingGridHorizontalSpacing: null,
	drawingGridVerticalOrigin: null,
	drawingGridVerticalSpacing: null,
	embedSystemFonts: false,
	embedTrueTypeFonts: false,
	endnotePr: null,
	evenAndOddHeaders: false,
	footnotePr: null,
	forceUpgrade: null,
	formsDesign: null,
	gutterAtTop: null,
	hdrShapeDefaults: null,
	hideGrammaticalErrors: null,
	hidePageBoundaries: false,
	hideSpellingErrors: null,
	hyphenationZone: null,
	ignoreMixedContent: null,
	linkStyles: null,
	listSeparator: null,
	mailMerge: null,
	mirrorMargins: false,
	noLineBreaksAfter: null,
	noLineBreaksBefore: null,
	noPunctuationKerning: null,
	printFormsData: false,
	printFractionalCharacterWidth: false,
	printPostScriptOverText: false,
	printTwoOnOne: null,
	proofState: null,
	readModeInkLockDown: null,
	removeDateAndTime: false,
	removePersonalInformation: false,
	revisionView: null,
	rsids: null,
	saveFormsData: false,
	saveInvalidXml: null,
	savePreviewPicture: null,
	saveSubsetFonts: false,
	saveThroughXslt: null,
	saveXmlDataOnly: null,
	shapeDefaults: null,
	showEnvelope: null,
	showXMLTags: null,
	smartTagType: null,
	strictFirstAndLastChars: null,
	styleLockQFSet: null,
	styleLockTheme: null,
	stylePaneFormatFilter: null,
	stylePaneSortMethod: null,
	summaryLength: null,
	themeFontLang: null,
	trackRevisions: false,
	updateFields: null,
	useXSLTWhenSaving: null,
	view: null,
	writeProtection: null,
	zoom: null,
};

enum SettingType {
	Captions,
	CharacterSpacing,
	ColorSchemeMapping,
	Compat,
	DecimalNumber,
	DecimalNumberOrPrecent,
	DocProtect,
	DocRsids,
	DocType,
	DocVars,
	EdnDocProps,
	Empty,
	FtnDocProps,
	Kinsoku,
	Language,
	MailMerge,
	OnOff,
	Proof,
	ReadingModeInkLockDown,
	Relationship,
	SaveThroughXslt,
	ShapeDefaults,
	SmartTagType,
	String,
	StylePaneFilter,
	StyleSort,
	TrackChangesView,
	TwipsMeasure,
	View,
	WriteProtection,
	WritingStyle,
	Zoom,
}

type SettingMeta =
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.OnOff;
	  }
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.Relationship;
			ooxmlRelationshipType: RelationshipType;
	  }
	| {
			// Unsupported
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType;
	  };

const settingsMeta: SettingMeta[] = [
	{
		docxmlName: 'writeProtection',
		// <xsd:element name="writeProtection" type="CT_WriteProtection" minOccurs="0"/>
		ooxmlLocalName: 'writeProtection',
		ooxmlType: SettingType.WriteProtection,
	},
	{
		docxmlName: 'view',
		// <xsd:element name="view" type="CT_View" minOccurs="0"/>
		ooxmlLocalName: 'view',
		ooxmlType: SettingType.View,
	},
	{
		docxmlName: 'zoom',
		// <xsd:element name="zoom" type="CT_Zoom" minOccurs="0"/>
		ooxmlLocalName: 'zoom',
		ooxmlType: SettingType.Zoom,
	},
	{
		docxmlName: 'removePersonalInformation',
		// <xsd:element name="removePersonalInformation" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'removePersonalInformation',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'removeDateAndTime',
		// <xsd:element name="removeDateAndTime" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'removeDateAndTime',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'hidePageBoundaries',
		// <xsd:element name="doNotDisplayPageBoundaries" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotDisplayPageBoundaries',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'displayBackgroundShape',
		// <xsd:element name="displayBackgroundShape" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'displayBackgroundShape',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'printPostScriptOverText',
		// <xsd:element name="printPostScriptOverText" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'printPostScriptOverText',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'printFractionalCharacterWidth',
		// <xsd:element name="printFractionalCharacterWidth" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'printFractionalCharacterWidth',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'printFormsData',
		// <xsd:element name="printFormsData" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'printFormsData',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'embedTrueTypeFonts',
		// <xsd:element name="embedTrueTypeFonts" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'embedTrueTypeFonts',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'embedSystemFonts',
		// <xsd:element name="embedSystemFonts" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'embedSystemFonts',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'saveSubsetFonts',
		// <xsd:element name="saveSubsetFonts" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'saveSubsetFonts',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'saveFormsData',
		// <xsd:element name="saveFormsData" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'saveFormsData',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'mirrorMargins',
		// <xsd:element name="mirrorMargins" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'mirrorMargins',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'alignBordersAndEdges',
		// <xsd:element name="alignBordersAndEdges" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'alignBordersAndEdges',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'bordersDoNotSurroundHeader',
		// <xsd:element name="bordersDoNotSurroundHeader" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'bordersDoNotSurroundHeader',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'bordersDoNotSurroundFooter',
		// <xsd:element name="bordersDoNotSurroundFooter" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'bordersDoNotSurroundFooter',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'gutterAtTop',
		// <xsd:element name="gutterAtTop" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'gutterAtTop',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'hideSpellingErrors',
		// <xsd:element name="hideSpellingErrors" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'hideSpellingErrors',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'hideGrammaticalErrors',
		// <xsd:element name="hideGrammaticalErrors" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'hideGrammaticalErrors',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'activeWritingStyle',
		// <xsd:element name="activeWritingStyle" type="CT_WritingStyle" minOccurs="0" maxOccurs="unbounded"/>
		ooxmlLocalName: 'activeWritingStyle',
		ooxmlType: SettingType.WritingStyle,
	},
	{
		docxmlName: 'proofState',
		// <xsd:element name="proofState" type="CT_Proof" minOccurs="0"/>
		ooxmlLocalName: 'proofState',
		ooxmlType: SettingType.Proof,
	},
	{
		docxmlName: 'formsDesign',
		// <xsd:element name="formsDesign" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'formsDesign',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'attachedTemplate',
		// <xsd:element name="attachedTemplate" type="CT_Rel" minOccurs="0"/>
		ooxmlLocalName: 'attachedTemplate',
		ooxmlType: SettingType.Relationship,
	},
	{
		docxmlName: 'linkStyles',
		// <xsd:element name="linkStyles" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'linkStyles',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'stylePaneFormatFilter',
		// <xsd:element name="stylePaneFormatFilter" type="CT_StylePaneFilter" minOccurs="0"/>
		ooxmlLocalName: 'stylePaneFormatFilter',
		ooxmlType: SettingType.StylePaneFilter,
	},
	{
		docxmlName: 'stylePaneSortMethod',
		// <xsd:element name="stylePaneSortMethod" type="CT_StyleSort" minOccurs="0"/>
		ooxmlLocalName: 'stylePaneSortMethod',
		ooxmlType: SettingType.StyleSort,
	},
	{
		docxmlName: 'documentType',
		// <xsd:element name="documentType" type="CT_DocType" minOccurs="0"/>
		ooxmlLocalName: 'documentType',
		ooxmlType: SettingType.DocType,
	},
	{
		docxmlName: 'mailMerge',
		// <xsd:element name="mailMerge" type="CT_MailMerge" minOccurs="0"/>
		ooxmlLocalName: 'mailMerge',
		ooxmlType: SettingType.MailMerge,
	},
	{
		docxmlName: 'revisionView',
		// <xsd:element name="revisionView" type="CT_TrackChangesView" minOccurs="0"/>
		ooxmlLocalName: 'revisionView',
		ooxmlType: SettingType.TrackChangesView,
	},
	{
		docxmlName: 'trackRevisions',
		// <xsd:element name="trackRevisions" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'trackRevisions',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'doNotTrackMoves',
		// <xsd:element name="doNotTrackMoves" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotTrackMoves',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'doNotTrackFormatting',
		// <xsd:element name="doNotTrackFormatting" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotTrackFormatting',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'documentProtection',
		// <xsd:element name="documentProtection" type="CT_DocProtect" minOccurs="0"/>
		ooxmlLocalName: 'documentProtection',
		ooxmlType: SettingType.DocProtect,
	},
	{
		docxmlName: 'autoFormatOverride',
		// <xsd:element name="autoFormatOverride" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'autoFormatOverride',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'styleLockTheme',
		// <xsd:element name="styleLockTheme" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'styleLockTheme',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'styleLockQFSet',
		// <xsd:element name="styleLockQFSet" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'styleLockQFSet',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'defaultTabStop',
		// <xsd:element name="defaultTabStop" type="CT_TwipsMeasure" minOccurs="0"/>
		ooxmlLocalName: 'defaultTabStop',
		ooxmlType: SettingType.TwipsMeasure,
	},
	{
		docxmlName: 'autoHyphenation',
		// <xsd:element name="autoHyphenation" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'autoHyphenation',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'consecutiveHyphenLimit',
		// <xsd:element name="consecutiveHyphenLimit" type="CT_DecimalNumber" minOccurs="0"/>
		ooxmlLocalName: 'consecutiveHyphenLimit',
		ooxmlType: SettingType.DecimalNumber,
	},
	{
		docxmlName: 'hyphenationZone',
		// <xsd:element name="hyphenationZone" type="CT_TwipsMeasure" minOccurs="0"/>
		ooxmlLocalName: 'hyphenationZone',
		ooxmlType: SettingType.TwipsMeasure,
	},
	{
		docxmlName: 'doNotHyphenateCaps',
		// <xsd:element name="doNotHyphenateCaps" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotHyphenateCaps',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'showEnvelope',
		// <xsd:element name="showEnvelope" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'showEnvelope',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'summaryLength',
		// <xsd:element name="summaryLength" type="CT_DecimalNumberOrPrecent" minOccurs="0"/>
		ooxmlLocalName: 'summaryLength',
		ooxmlType: SettingType.DecimalNumberOrPrecent,
	},
	{
		docxmlName: 'clickAndTypeStyle',
		// <xsd:element name="clickAndTypeStyle" type="CT_String" minOccurs="0"/>
		ooxmlLocalName: 'clickAndTypeStyle',
		ooxmlType: SettingType.String,
	},
	{
		docxmlName: 'defaultTableStyle',
		// <xsd:element name="defaultTableStyle" type="CT_String" minOccurs="0"/>
		ooxmlLocalName: 'defaultTableStyle',
		ooxmlType: SettingType.String,
	},
	{
		docxmlName: 'evenAndOddHeaders',
		// <xsd:element name="evenAndOddHeaders" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'evenAndOddHeaders',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'bookFoldRevPrinting',
		// <xsd:element name="bookFoldRevPrinting" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'bookFoldRevPrinting',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'bookFoldPrinting',
		// <xsd:element name="bookFoldPrinting" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'bookFoldPrinting',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'bookFoldPrintingSheets',
		// <xsd:element name="bookFoldPrintingSheets" type="CT_DecimalNumber" minOccurs="0"/>
		ooxmlLocalName: 'bookFoldPrintingSheets',
		ooxmlType: SettingType.DecimalNumber,
	},
	{
		docxmlName: 'drawingGridHorizontalSpacing',
		// <xsd:element name="drawingGridHorizontalSpacing" type="CT_TwipsMeasure" minOccurs="0"/>
		ooxmlLocalName: 'drawingGridHorizontalSpacing',
		ooxmlType: SettingType.TwipsMeasure,
	},
	{
		docxmlName: 'drawingGridVerticalSpacing',
		// <xsd:element name="drawingGridVerticalSpacing" type="CT_TwipsMeasure" minOccurs="0"/>
		ooxmlLocalName: 'drawingGridVerticalSpacing',
		ooxmlType: SettingType.TwipsMeasure,
	},
	{
		docxmlName: 'displayHorizontalDrawingGridEvery',
		// <xsd:element name="displayHorizontalDrawingGridEvery" type="CT_DecimalNumber" minOccurs="0"/>
		ooxmlLocalName: 'displayHorizontalDrawingGridEvery',
		ooxmlType: SettingType.DecimalNumber,
	},
	{
		docxmlName: 'displayVerticalDrawingGridEvery',
		// <xsd:element name="displayVerticalDrawingGridEvery" type="CT_DecimalNumber" minOccurs="0"/>
		ooxmlLocalName: 'displayVerticalDrawingGridEvery',
		ooxmlType: SettingType.DecimalNumber,
	},
	{
		docxmlName: 'doNotUseMarginsForDrawingGridOrigin',
		// <xsd:element name="doNotUseMarginsForDrawingGridOrigin" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotUseMarginsForDrawingGridOrigin',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'drawingGridHorizontalOrigin',
		// <xsd:element name="drawingGridHorizontalOrigin" type="CT_TwipsMeasure" minOccurs="0"/>
		ooxmlLocalName: 'drawingGridHorizontalOrigin',
		ooxmlType: SettingType.TwipsMeasure,
	},
	{
		docxmlName: 'drawingGridVerticalOrigin',
		// <xsd:element name="drawingGridVerticalOrigin" type="CT_TwipsMeasure" minOccurs="0"/>
		ooxmlLocalName: 'drawingGridVerticalOrigin',
		ooxmlType: SettingType.TwipsMeasure,
	},
	{
		docxmlName: 'doNotShadeFormData',
		// <xsd:element name="doNotShadeFormData" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotShadeFormData',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'noPunctuationKerning',
		// <xsd:element name="noPunctuationKerning" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'noPunctuationKerning',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'characterSpacingControl',
		// <xsd:element name="characterSpacingControl" type="CT_CharacterSpacing" minOccurs="0"/>
		ooxmlLocalName: 'characterSpacingControl',
		ooxmlType: SettingType.CharacterSpacing,
	},
	{
		docxmlName: 'printTwoOnOne',
		// <xsd:element name="printTwoOnOne" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'printTwoOnOne',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'strictFirstAndLastChars',
		// <xsd:element name="strictFirstAndLastChars" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'strictFirstAndLastChars',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'noLineBreaksAfter',
		// <xsd:element name="noLineBreaksAfter" type="CT_Kinsoku" minOccurs="0"/>
		ooxmlLocalName: 'noLineBreaksAfter',
		ooxmlType: SettingType.Kinsoku,
	},
	{
		docxmlName: 'noLineBreaksBefore',
		// <xsd:element name="noLineBreaksBefore" type="CT_Kinsoku" minOccurs="0"/>
		ooxmlLocalName: 'noLineBreaksBefore',
		ooxmlType: SettingType.Kinsoku,
	},
	{
		docxmlName: 'savePreviewPicture',
		// <xsd:element name="savePreviewPicture" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'savePreviewPicture',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'doNotValidateAgainstSchema',
		// <xsd:element name="doNotValidateAgainstSchema" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotValidateAgainstSchema',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'saveInvalidXml',
		// <xsd:element name="saveInvalidXml" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'saveInvalidXml',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'ignoreMixedContent',
		// <xsd:element name="ignoreMixedContent" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'ignoreMixedContent',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'alwaysShowPlaceholderText',
		// <xsd:element name="alwaysShowPlaceholderText" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'alwaysShowPlaceholderText',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'doNotDemarcateInvalidXml',
		// <xsd:element name="doNotDemarcateInvalidXml" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotDemarcateInvalidXml',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'saveXmlDataOnly',
		// <xsd:element name="saveXmlDataOnly" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'saveXmlDataOnly',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'useXSLTWhenSaving',
		// <xsd:element name="useXSLTWhenSaving" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'useXSLTWhenSaving',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'saveThroughXslt',
		// <xsd:element name="saveThroughXslt" type="CT_SaveThroughXslt" minOccurs="0"/>
		ooxmlLocalName: 'saveThroughXslt',
		ooxmlType: SettingType.SaveThroughXslt,
	},
	{
		docxmlName: 'showXMLTags',
		// <xsd:element name="showXMLTags" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'showXMLTags',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'alwaysMergeEmptyNamespace',
		// <xsd:element name="alwaysMergeEmptyNamespace" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'alwaysMergeEmptyNamespace',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'updateFields',
		// <xsd:element name="updateFields" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'updateFields',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'hdrShapeDefaults',
		// <xsd:element name="hdrShapeDefaults" type="CT_ShapeDefaults" minOccurs="0"/>
		ooxmlLocalName: 'hdrShapeDefaults',
		ooxmlType: SettingType.ShapeDefaults,
	},
	{
		docxmlName: 'footnotePr',
		// <xsd:element name="footnotePr" type="CT_FtnDocProps" minOccurs="0"/>
		ooxmlLocalName: 'footnotePr',
		ooxmlType: SettingType.FtnDocProps,
	},
	{
		docxmlName: 'endnotePr',
		// <xsd:element name="endnotePr" type="CT_EdnDocProps" minOccurs="0"/>
		ooxmlLocalName: 'endnotePr',
		ooxmlType: SettingType.EdnDocProps,
	},
	{
		docxmlName: 'compat',
		// <xsd:element name="compat" type="CT_Compat" minOccurs="0"/>
		ooxmlLocalName: 'compat',
		ooxmlType: SettingType.Compat,
	},
	{
		docxmlName: 'docVars',
		// <xsd:element name="docVars" type="CT_DocVars" minOccurs="0"/>
		ooxmlLocalName: 'docVars',
		ooxmlType: SettingType.DocVars,
	},
	{
		docxmlName: 'rsids',
		// <xsd:element name="rsids" type="CT_DocRsids" minOccurs="0"/>
		ooxmlLocalName: 'rsids',
		ooxmlType: SettingType.DocRsids,
	},

	// @TODO:
	// <xsd:element ref="m:mathPr" minOccurs="0" maxOccurs="1"/>

	{
		docxmlName: 'attachedSchema',
		// <xsd:element name="attachedSchema" type="CT_String" minOccurs="0" maxOccurs="unbounded"/>
		ooxmlLocalName: 'attachedSchema',
		ooxmlType: SettingType.String,
	},
	{
		docxmlName: 'themeFontLang',
		// <xsd:element name="themeFontLang" type="CT_Language" minOccurs="0" maxOccurs="1"/>
		ooxmlLocalName: 'themeFontLang',
		ooxmlType: SettingType.Language,
	},
	{
		docxmlName: 'clrSchemeMapping',
		// <xsd:element name="clrSchemeMapping" type="CT_ColorSchemeMapping" minOccurs="0"/>
		ooxmlLocalName: 'clrSchemeMapping',
		ooxmlType: SettingType.ColorSchemeMapping,
	},
	{
		docxmlName: 'doNotIncludeSubdocsInStats',
		// <xsd:element name="doNotIncludeSubdocsInStats" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotIncludeSubdocsInStats',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'doNotAutoCompressPictures',
		// <xsd:element name="doNotAutoCompressPictures" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotAutoCompressPictures',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'forceUpgrade',
		// <xsd:element name="forceUpgrade" type="CT_Empty" minOccurs="0" maxOccurs="1"/>
		ooxmlLocalName: 'forceUpgrade',
		ooxmlType: SettingType.Empty,
	},
	{
		docxmlName: 'captions',
		// <xsd:element name="captions" type="CT_Captions" minOccurs="0" maxOccurs="1"/>
		ooxmlLocalName: 'captions',
		ooxmlType: SettingType.Captions,
	},
	{
		docxmlName: 'readModeInkLockDown',
		// <xsd:element name="readModeInkLockDown" type="CT_ReadingModeInkLockDown" minOccurs="0"/>
		ooxmlLocalName: 'readModeInkLockDown',
		ooxmlType: SettingType.ReadingModeInkLockDown,
	},
	{
		docxmlName: 'smartTagType',
		// <xsd:element name="smartTagType" type="CT_SmartTagType" minOccurs="0" maxOccurs="unbounded"/>
		ooxmlLocalName: 'smartTagType',
		ooxmlType: SettingType.SmartTagType,
	},

	// @TODO:
	// <xsd:element ref="sl:schemaLibrary" minOccurs="0" maxOccurs="1"/>

	{
		docxmlName: 'shapeDefaults',
		// <xsd:element name="shapeDefaults" type="CT_ShapeDefaults" minOccurs="0"/>
		ooxmlLocalName: 'shapeDefaults',
		ooxmlType: SettingType.ShapeDefaults,
	},
	{
		docxmlName: 'doNotEmbedSmartTags',
		// <xsd:element name="doNotEmbedSmartTags" type="CT_OnOff" minOccurs="0"/>
		ooxmlLocalName: 'doNotEmbedSmartTags',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'decimalSymbol',
		// <xsd:element name="decimalSymbol" type="CT_String" minOccurs="0" maxOccurs="1"/>
		ooxmlLocalName: 'decimalSymbol',
		ooxmlType: SettingType.String,
	},
	{
		docxmlName: 'listSeparator',
		// <xsd:element name="listSeparator" type="CT_String" minOccurs="0" maxOccurs="1"/>
		ooxmlLocalName: 'listSeparator',
		ooxmlType: SettingType.String,
	},
].filter(
	// Only ON/OFF and the (attachedTemplate) relationship setting types are supported for now. Even
	// though all the schema information has been converted from XSD to JS array (etc.), everything
	// for which the logic is not implemented is herewith filtered out :)
	(meta): meta is SettingMeta =>
		meta.ooxmlType === SettingType.OnOff || meta.ooxmlType === SettingType.Relationship,
);

export class SettingsXml extends XmlFile {
	public static contentType = FileMime.settings;

	public readonly relationships: RelationshipsXml;

	#props: SettingsI;

	public constructor(
		location: string,
		relationships = new RelationshipsXml(
			`${path.dirname(location)}/_rels/${path.basename(location)}.rels`,
		),
		settings: SettingsI = DEFAULT_SETTINGS,
	) {
		super(location);
		this.relationships = relationships;
		this.#props = Object.assign({}, settings);
	}

	/**
	 * Set a setting.
	 */
	public set<Key extends keyof SettingsI>(key: Key, value: SettingsI[Key]): void {
		const meta = settingsMeta.find((meta) => meta.docxmlName === key);
		if (!meta) {
			throw new Error(`Unsupported setting "${key}"`);
		}
		if (meta.ooxmlType === SettingType.Relationship) {
			this.#props[key] = value
				? (this.relationships.add(meta.ooxmlRelationshipType, value as string) as SettingsI[Key])
				: value;
		} else {
			this.#props[key] = value;
		}
	}

	/**
	 * Get a setting.
	 */
	public get<Key extends keyof SettingsI>(key: Key): SettingsI[Key] {
		const meta = settingsMeta.find((meta) => meta.docxmlName === key);
		if (!meta) {
			throw new Error(`Unsupported setting "${key}"`);
		}
		if (meta.ooxmlType === SettingType.Relationship) {
			return this.#props[key]
				? (this.relationships.getTarget(this.#props[key] as string) as SettingsI[Key])
				: (this.#props[key] as SettingsI[Key]);
		} else {
			return this.#props[key];
		}
	}

	/**
	 * Returns a list of setting key values (similar to `Object.entries`). Useful for cloning these
	 * settings into a new instance.
	 */
	public entries() {
		return Object.keys(this.#props).map((key) => [key, this.get(key as keyof SettingsI)]) as Array<
			[keyof SettingsI, SettingsI[keyof SettingsI]]
		>;
	}

	protected toNode(): Document {
		return create(
			`<w:settings ${ALL_NAMESPACE_DECLARATIONS}>
				{
					if ($trackRevisions) then element ${QNS.w}trackRevisions {
						(: attribute ${QNS.w}val { $trackRevisions } :)
					} else (),
					if ($evenAndOddHeaders) then element ${QNS.w}evenAndOddHeaders {
						attribute ${QNS.w}val { $evenAndOddHeaders }
					} else (),
					if ($attachedTemplate) then element ${QNS.w}attachedTemplate {
						attribute ${QNS.r}id { $attachedTemplate }
					} else ()
				}
			</w:settings>`,
			{
				props: settingsMeta.map(meta => ({
					...meta,
					value: this.#props[meta.docxmlName]
				}))
			}
			this.#props,
			true,
		);
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): File[] {
		return [this, ...this.relationships.getRelated()];
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<SettingsXml> {
		let relationships;

		const relationshipsLocation = `${path.dirname(location)}/_rels/${path.basename(location)}.rels`;
		try {
			relationships = await RelationshipsXml.fromArchive(archive, relationshipsLocation);
		} catch (_error: unknown) {
			// console.error(
			// 	'Warning, relationships could not be resolved\n' +
			// 		((error as Error).stack || (error as Error).message),
			// );
		}

		const settings = evaluateXPathToMap<SettingsI>(
			`/${QNS.w}settings/map {
				"trackRevisions": docxml:ct-on-off(./${QNS.w}trackChanges),
				"evenAndOddHeaders": docxml:ct-on-off(./${QNS.w}evenAndOddHeaders)
			}`,
			await archive.readXml(location),
		);
		return new SettingsXml(
			location,
			relationships || new RelationshipsXml(relationshipsLocation),
			settings,
		);
	}
}
