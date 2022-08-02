import { XmlFile } from '../classes/XmlFile.ts';
import { ZipArchive } from '../classes/ZipArchive.ts';
import { Ppr, PprI } from '../shared/ppr.ts';
import { Rpr, RprI } from '../shared/rpr.ts';
import { Tblpr, TblprI } from '../shared/tblpr.ts';
import { ContentType } from '../types.ts';
import { create } from '../util/dom.ts';
import { createRandomId } from '../util/identifiers.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../util/namespaces.ts';
import { evaluateXPathToArray } from '../util/xquery.ts';

type StyleCommons = {
	id: string;
	name?: string | null;
	basedOn?: string | null;
	isDefault?: boolean | null;
};
type ParagraphStyle = {
	type: 'paragraph';
	paragraphProperties?: PprI;
	textProperties?: RprI;
	tableProperties?: null;
};
type TableStyle = {
	type: 'table';
	tableProperties?: TblprI;
	paragraphProperties?: null;
	textProperties?: null;
};

type Style = StyleCommons & (ParagraphStyle | TableStyle);

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

export class Styles extends XmlFile {
	public static contentType = ContentType.styles;

	private readonly latentStyles: LatentStyle[] = [];
	private readonly styles: Style[] = [];

	public constructor(location: string) {
		super(location);
	}

	public ensureStyle(styleName: string) {
		if (styleName && !this.hasStyle(styleName)) {
			this.add({
				id: styleName,
				type: 'paragraph',
				basedOn: 'Normal',
			});
		}
	}

	public isEmpty() {
		return !this.styles.length && !this.latentStyles.length;
	}

	protected toNode(): Document {
		// @TODO look at attribute w:document@mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14"
		return create(
			`
				<w:styles ${ALL_NAMESPACE_DECLARATIONS}>
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
									if ($style('tblpr')) then $style('tblpr') else (),
									if ($style('ppr')) then $style('ppr') else (),
									if ($style('rpr')) then $style('rpr') else ()
								}
							</w:style>
					}
				</w:styles>
			`,
			{
				styles: this.styles.map(
					({ paragraphProperties, textProperties, tableProperties, ...style }) => ({
						...style,
						ppr: Ppr.toNode(paragraphProperties as ParagraphStyle['paragraphProperties']),
						rpr: Rpr.toNode(textProperties as ParagraphStyle['textProperties']),
						tblpr: Tblpr.toNode(tableProperties as TableStyle['tableProperties']),
					}),
				),
				latentStyles: this.latentStyles,
			},
			true,
		);
	}

	public add(properties: Omit<Style, 'id'> & { id?: string }) {
		const style = {
			...properties,
			id: properties.id || properties.name?.replace(/[^a-zA-Z0-9]/g, '') || createRandomId(),
		} as Style;
		this.styles.push(style);
		return style.id;
	}

	public addLatent(properties: LatentStyle) {
		this.latentStyles.push(properties);
	}

	public hasStyle(id: string) {
		return (
			this.styles.some((style) => style.id === id) ||
			this.latentStyles.some((style) => style.name === id)
		);
	}

	public get(id: string) {
		return this.styles.find((style) => style.id === id);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static async fromArchive(archive: ZipArchive, location: string): Promise<Styles> {
		const dom = await archive.readXml(location);

		const instance = new Styles(location);

		evaluateXPathToArray(
			`
				array { /*/${QNS.w}style[@${QNS.w}type = ("paragraph", "table") and @${QNS.w}styleId]/map {
					"id": @${QNS.w}styleId/string(),
					"type": @${QNS.w}type/string(),
					"name": ./${QNS.w}name/@${QNS.w}val/string(),
					"basedOn": ./${QNS.w}basedOn/@${QNS.w}val/string(),
					"isDefault": @${QNS.w}default/ooxml:is-on-off-enabled(.),
					"tblpr": ./${QNS.w}tblPr,
					"ppr": ./${QNS.w}pPr,
					"rpr": ./${QNS.w}rPr
				}}
			`,
			dom,
		).forEach(({ ppr, rpr, tblpr, ...json }) =>
			instance.add({
				...json,
				paragraphProperties: Ppr.fromNode(ppr),
				textProperties: Rpr.fromNode(rpr),
				tableProperties: Tblpr.fromNode(tblpr),
			}),
		);

		evaluateXPathToArray(
			`
				array { /*/${QNS.w}latentStyles/${QNS.w}lsdException/map {
					"name": @${QNS.w}name/string(),
					"uiPriority": @${QNS.w}uiPriority/number(),
					"qFormat": @${QNS.w}qFormat/ooxml:is-on-off-enabled(.),
					"unhideWhenUsed": @${QNS.w}unhideWhenUsed/ooxml:is-on-off-enabled(.),
					"locked": @${QNS.w}locked/ooxml:is-on-off-enabled(.),
					"semiHidden": @${QNS.w}semiHidden/ooxml:is-on-off-enabled(.)
				}}
			`,
			dom,
		).forEach((json) => instance.addLatent(json));

		return instance;
	}
}
