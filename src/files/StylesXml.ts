import { Archive } from '../classes/Archive.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { ThemeXml } from './ThemeXml.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../properties/paragraph-properties.ts';
import {
	type TableConditionalProperties,
	type TableConditionalTypes,
	tableConditionalPropertiesFromNode,
	tableConditionalPropertiesToNode,
} from '../properties/table-conditional-properties.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../properties/table-properties.ts';
import {
	type TextProperties,
	type FontEncodingProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../properties/text-properties.ts';
import { create } from '../utilities/dom.ts';
import { createRandomId } from '../utilities/identifiers.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToArray, evaluateXPathToFirstNode, evaluateXPathToString } from '../utilities/xquery.ts';

type ParagraphStyle = {
	type: 'paragraph';
	paragraph?: ParagraphProperties;
	text?: TextProperties;
	table?: null;
};

type CharacterStyle = {
	type: 'character';
	paragraph?: null;
	text?: TextProperties;
	table?: null;
};

type TableStyle = {
	type: 'table';
	paragraph?: null;
	text?: null;
	table?: TableProperties & {
		conditions?: Partial<Record<TableConditionalTypes, Omit<TableConditionalProperties, 'type'>>>;
	};
};

export type AnyStyleDefinition = {
	id: string;
	name?: string | null;
	basedOn?: string | null;
	isDefault?: boolean | null;
} & (CharacterStyle | ParagraphStyle | TableStyle);

/**
 * https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_lsdException_topic_ID0EX4NT.html
 */
type LatentStyle = {
	name: string;
	locked?: boolean | null;
	uiPriority?: number | null;
	semiHidden?: boolean | null;
	unhideWhenUsed?: boolean | null;
	qFormat?: boolean | null;
};

export type ThemeProperties = {
	fontScheme: {
		minorFont: string;
		majorFont?: string;
	}
}

export class StylesXml extends XmlFile {
	public static contentType = FileMime.styles;

	readonly #latentStyles: LatentStyle[] = [];
	readonly #styles: AnyStyleDefinition[] = [];

	docDefaults: TextProperties | undefined;

	public constructor(location: string) {
		super(location);
	}

	/**
	 * Ensure that a style with this identifier exists. If it doesn't already exist, an empty
	 * (paragraph) style is added just in time.
	 *
	 * @deprecated This is probably an incorrect approach to fixing missing styles.
	 */
	public ensureStyle(id: string) {
		if (id && !this.hasStyle(id)) {
			this.add({
				id: id,
				type: 'paragraph',
				basedOn: 'Normal',
			});
		}
	}

	public isEmpty() {
		return !this.#styles.length && !this.#latentStyles.length;
	}

	protected toNode(): Document {
		// @TODO look at attribute w:document@mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14"
		return create(
			`<w:styles ${ALL_NAMESPACE_DECLARATIONS}>
				{
					if (count($latentStyles) > 0) then element ${QNS.w}latentStyles {
						attribute ${QNS.w}defLockedState { "0" },
						attribute ${QNS.w}defUIPriority { "99" },
						attribute ${QNS.w}defSemiHidden { "0" },
						attribute ${QNS.w}defUnhideWhenUsed { "0" },
						attribute ${QNS.w}defQFormat { "0" },
						attribute ${QNS.w}count { count($latentStyles) },
						for $latentStyle in array:flatten($latentStyles)
							return element ${QNS.w}lsdException {
								attribute ${QNS.w}name { $latentStyle('name') },
								if (exists($latentStyle('locked')))
									then attribute ${QNS.w}locked { $latentStyle('locked') }
									else (),
								if (exists($latentStyle('uiPriority')))
									then attribute ${QNS.w}uiPriority { $latentStyle('uiPriority') }
									else (),
								if (exists($latentStyle('semiHidden')))
									then attribute ${QNS.w}semiHidden { $latentStyle('semiHidden') }
									else (),
								if (exists($latentStyle('unhideWhenUsed')))
									then attribute ${QNS.w}unhideWhenUsed { $latentStyle('unhideWhenUsed') }
									else (),
								if (exists($latentStyle('qFormat')))
									then attribute ${QNS.w}qFormat { $latentStyle('qFormat') }
									else ()
							}
					} else (),
					for $style in array:flatten($styles)
						return <w:style>
							{
								attribute ${QNS.w}type { $style('type') },
								attribute ${QNS.w}styleId { $style('id') },
								if ($style('isDefault')) then attribute ${QNS.w}default {"1"} else (),
								if ($style('name')) then <w:name w:val="{$style('name')}" /> else (),
								if ($style('basedOn')) then <w:basedOn w:val="{$style('basedOn')}" /> else (),
								if ($style('ppr')) then $style('ppr') else (),
								if ($style('rpr')) then $style('rpr') else (),
								if ($style('tblpr')) then $style('tblpr') else (),
								$style('conditions')
							}
						</w:style>
				}
			</w:styles>`,
			{
				styles: this.#styles.map(({ paragraph, text, table, ...style }) => ({
					...style,
					ppr: paragraphPropertiesToNode(paragraph as ParagraphStyle['paragraph']),
					rpr: textPropertiesToNode(text as ParagraphStyle['text']),
					tblpr: tablePropertiesToNode(table as TableStyle['table']),
					conditions: table?.conditions
						? Object.entries(table.conditions).map(([type, properties]) =>
								tableConditionalPropertiesToNode({
									...properties,
									type: type as TableConditionalTypes,
								}),
						  )
						: null,
				})),
				latentStyles: this.#latentStyles,
			},
			true,
		);
	}

	/**
	 * Add a custom style to the available style palette. If it does not have an identifier already,
	 * the system will propose an identifier based on the style name, or create a unique GUID. This
	 * method throws when the identifier is not unique.
	 */
	public add(properties: Omit<AnyStyleDefinition, 'id'> & { id?: string }) {
		const id =
			properties.id || properties.name?.replace(/[^a-zA-Z0-9]/g, '') || createRandomId('style');
		if (this.hasStyle(id)) {
			throw new Error(`A style with identifier "${id}" already exists.`);
		}
		const style = {
			...properties,
			id,
		} as AnyStyleDefinition;
		this.#styles.push(style);
		return style.id;
	}

	/**
	 * Add several custom styles to the available palette. Useful for cloning the style configuration of
	 * another DOCX.
	 */
	public addStyles(styles: AnyStyleDefinition[]) {
		styles.forEach((style) => this.add(style));
	}

	/**
	 * The list of custom styles. Does not include latent styles or default style;
	 */
	public get styles(): AnyStyleDefinition[] {
		return this.#styles;
	}

	/**
	 * Adds a latent style, which means that the Word processor should determine its actual properties
	 */
	public addLatent(properties: LatentStyle) {
		this.#latentStyles.push(properties);
	}

	public addDefault(properties: TextProperties) {
		this.docDefaults = properties;
	}

	/**
	 * Checks wether a custom style or a latent style with this identifier already exists.
	 */
	public hasStyle(id: string) {
		return (
			this.#styles.some((style) => style.id === id) ||
			this.#latentStyles.some((style) => style.name === id)
		);
	}

	/**
	 * Gets the style data by its identifier.
	 */
	public get(id: string) {
		return this.#styles.find((style) => style.id === id);
	}

	public static fromDom(dom: Document, location: string, themeDefaults?: ThemeProperties): StylesXml {

		const instance = new StylesXml(location);

		// Check the document default styles are there.
		const defaultRunProperties = textPropertiesFromNode(evaluateXPathToFirstNode(`/*/${QNS.w}docDefaults/${QNS.w}rPrDefault/${QNS.w}rPr`, dom));
		if (defaultRunProperties) {
			instance.addDefault(
				defaultRunProperties
			);
		}

		if (instance.docDefaults?.font && typeof instance.docDefaults.font !== 'string' && themeDefaults) {
			for (const key in instance.docDefaults.font) {
				if (instance.docDefaults.font[key as keyof FontEncodingProperties] === null) {
					instance.docDefaults.font[key as keyof FontEncodingProperties] = themeDefaults.fontScheme.minorFont;
				}
			}
		}

		// Warning! Untyped objects
		instance.addStyles(
			evaluateXPathToArray(
				`array { /*/${QNS.w}style[@${QNS.w}type = ("paragraph", "table", "character") and @${QNS.w}styleId]/map {
					"id": @${QNS.w}styleId/string(),
					"type": @${QNS.w}type/string(),
					"name": ./${QNS.w}name/@${QNS.w}val/string(),
					"basedOn": ./${QNS.w}basedOn/@${QNS.w}val/string(),
					"isDefault": docxml:st-on-off(@${QNS.w}default),
					"tblpr": ./${QNS.w}tblPr,
					"tblStylePr": array{ ./${QNS.w}tblStylePr },
					"ppr": ./${QNS.w}pPr,
					"rpr": ./${QNS.w}rPr
				}}`,
				dom,
			).map(({ ppr, rpr, tblpr, tblStylePr, ...json }) => {
				const runProperties = textPropertiesFromNode(rpr);
				if (json.isDefault
					&& runProperties.font
					&& typeof runProperties.font !== 'string'
					&& instance.docDefaults
				) {
					for (const key in runProperties.font) {
						if (runProperties.font[key as keyof FontEncodingProperties] === null
							&& instance.docDefaults.font
							&& typeof instance.docDefaults!.font !== 'string') {
							runProperties.font[key as keyof FontEncodingProperties] = instance.docDefaults.font[key as keyof FontEncodingProperties];
						}
					}
				};
				return {
					...json,
					paragraph: paragraphPropertiesFromNode(ppr),
					text: runProperties,
					table: {
						...tablePropertiesFromNode(tblpr),
						...(tblStylePr.length
							? {
								conditions: (
									tblStylePr.map(tableConditionalPropertiesFromNode) as TableConditionalProperties[]
								).reduce(
									(m, { type, ...style }) =>
										Object.assign(m, {
											[type]: style,
										}),
									{}
								)
							}
							: {}),
					},
				}
			}
			));

		// Warning! Untyped objects
		evaluateXPathToArray(
			`array { /*/${QNS.w}latentStyles/${QNS.w}lsdException/map {
				"name": @${QNS.w}name/string(),
				"uiPriority": @${QNS.w}uiPriority/number(),
				"qFormat": docxml:st-on-off(@${QNS.w}qFormat),
				"unhideWhenUsed": docxml:st-on-off(@${QNS.w}unhideWhenUsed),
				"locked": docxml:st-on-off(@${QNS.w}locked),
				"semiHidden": docxml:st-on-off(@${QNS.w}semiHidden)
			}}`,
			dom,
		).forEach((json) => instance.addLatent(json));

		return instance;
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: Archive, location: string): Promise<StylesXml> {
		// The minorFont is the default font specified in the theme1.xml file. This font is used
		// for Normal styles if no other fonts are specified anywhere in the template.
		const themeProperties: ThemeProperties = { fontScheme: { minorFont: '' } };
		// This is where the default fonts used by Word are. If a completely empty document
		// is used as a template, this is where the fonts + encodings are found
		if (archive.hasFile('word/theme/theme1.xml')) {
			const defaultTheme = await archive.readXml('word/theme/theme1.xml');
			if (defaultTheme) {
				themeProperties.fontScheme.minorFont = evaluateXPathToString(`./descendant-or-self::${QNS.a}minorFont/${QNS.a}latin/@typeface`, defaultTheme) ?? 'Wingdings';
			}
		};

		if (archive.hasFile(location)) {
			const dom = await archive.readXml(location);
			return this.fromDom(dom, location, themeProperties);
		}
		return Promise.resolve(new StylesXml(location));
	}
}
