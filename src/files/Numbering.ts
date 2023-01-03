import { Archive } from '../classes/Archive.ts';
import { NumberMap } from '../classes/NumberMap.ts';
import { XmlFile } from '../classes/XmlFile.ts';
import { FileMime } from '../enums.ts';
import { create } from '../utilities/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

type AbstractNumbering = {
	id: number;
	type: 'hybridMultilevel' | 'singleLevel' | 'multilevel' | null;
	levels: Array<{
		start: number | null;
		format:
			| 'bullet'
			// the cardinal text of the run language. (In English, One, Two, Three, etc.):
			| 'cardinalText'
			// Set of symbols from the Chicago Manual of Style. (e.g., *, †, ‡, §):
			| 'chicago'
			// decimal numbering (1, 2, 3, 4, etc.):
			| 'decimal'
			// decimal number enclosed in a circle:
			| 'decimalEnclosedCircle'
			// decimal number followed by a period:
			| 'decimalEnclosedFullstop'
			// decimal number enclosed in parentheses:
			| 'decimalEnclosedParen'
			// decimal number but with a zero added to numbers 1 through 9:
			| 'decimalZero'
			// based on the run language (e.g., a, b, c, etc.). Letters repeat for values greater than the size of the alphabet:
			| 'lowerLetter'
			// lowercase Roman numerals (i, ii, iii, iv, etc.):
			| 'lowerRoman'
			// ordinal text of the run laguage. (In English, First, Second, Third, etc.):
			| 'ordinalText'
			// based on the run language (e.g., A, B, C, etc.). Letters repeat for values greater than the size of the alphabet:
			| 'upperLetter'
			// uppercase Roman numerals (I, II, III, IV, etc.):
			| 'upperRoman'
			| 'none'
			| null;
		text: string | null;
		alignment: 'left' | 'right' | 'center' | 'both' | null;
	}>;
};

type AbstractNumberingWithOptionalId = Omit<AbstractNumbering, 'id'> & { id?: number };

type ConcreteNumbering = {
	id: number;
	abstract: number;
};

export class Numbering extends XmlFile {
	public static contentType = FileMime.numbering;

	/**
	 * The abstract numbering rules.
	 *
	 * Each item correlates with <w:abstractNum>
	 */
	private readonly abstracts = new NumberMap<AbstractNumbering>(0);

	/**
	 * Concrete numbering rules, the ones that are directly associated with zero or more paragraphs.
	 *
	 * Each item correlates with <w:num>
	 */
	private readonly concretes = new NumberMap<ConcreteNumbering>(1);

	public isEmpty() {
		return !this.abstracts.size;
	}

	/**
	 * Register a new abstract numberign style and return the identifier.
	 *
	 * Not meant for public use.
	 */
	public addAbstract(style: AbstractNumberingWithOptionalId): number {
		const id = style.id || this.abstracts.getNextAvailableKey();
		if (this.abstracts.has(id)) {
			throw new Error(`There already is an abstract numbering "${id}"`);
		}
		this.abstracts.add({ ...style, id });
		return id;
	}

	/**
	 * Register a concrete implementation of an abstract numbering style and return the concrete
	 * identifier.
	 *
	 * Not meant for public use.
	 */
	public add(abstract: number | AbstractNumberingWithOptionalId): number {
		if (typeof abstract === 'object') {
			abstract = this.addAbstract(abstract);
		}
		if (!this.abstracts.has(abstract)) {
			throw new Error(`No abstract numbering at ID "${abstract}"`);
		}
		const id = this.concretes.getNextAvailableKey();
		this.concretes.add({ id, abstract });
		return id;
	}

	protected toNode(): Document {
		return create(
			`<w:numbering ${ALL_NAMESPACE_DECLARATIONS}>
				{
					for $abstract in array:flatten($abstracts)
						return element ${QNS.w}abstractNum {
							attribute ${QNS.w}abstractNumId { $abstract('id') },
							if ($abstract('type')) then element ${QNS.w}multiLevelType {
								attribute ${QNS.w}val { $abstract('type') }
							} else (),
							for $index in (0 to count(array:flatten($abstract('levels'))) - 1)
								let $lvl := $abstract('levels')($index + 1)
								return element ${QNS.w}lvl {
									attribute ${QNS.w}ilvl { $index },
									if (exists($lvl('start'))) then element ${QNS.w}start {
										attribute ${QNS.w}val { $lvl('start') }
									} else (),
									if (exists($lvl('format'))) then element ${QNS.w}numFmt {
										attribute ${QNS.w}val { $lvl('format') }
									} else (),
									if (exists($lvl('text'))) then element ${QNS.w}lvlText {
										attribute ${QNS.w}val { $lvl('text') }
									} else (),
									if (exists($lvl('alignment'))) then element ${QNS.w}lvlJc {
										attribute ${QNS.w}val { $lvl('alignment') }
									} else ()
								}
						},
					for $concrete in array:flatten($concretes)
						return element ${QNS.w}num {
							attribute ${QNS.w}numId { $concrete('id') },
							element ${QNS.w}abstractNumId {
								attribute ${QNS.w}val { $concrete('abstract') }
							}
						}
				}
			</w:numbering>`,
			{
				abstracts: this.abstracts.array(),
				concretes: this.concretes.array(),
			},
			true,
		);
	}

	public static fromNode(dom: Document, location: string): Numbering {
		const instance = new Numbering(location);
		const { concretes, abstracts } = evaluateXPathToMap<{
			concretes: ConcreteNumbering[];
			abstracts: AbstractNumbering[];
		}>(
			`map {
				"abstracts": array { /*/${QNS.w}abstractNum/map {
					"id": ./@${QNS.w}abstractNumId/number(),
					"type": ./${QNS.w}multiLevelType/@${QNS.w}val/string(),
					"levels": array {./${QNS.w}lvl/map {
						"start": ./${QNS.w}start/@${QNS.w}val/number(),
						"format": ./${QNS.w}numFmt/@${QNS.w}val/string(),
						"text": ./${QNS.w}lvlText/@${QNS.w}val/string(),
						"alignment": ./${QNS.w}lvlJc/@${QNS.w}val/string()
					}}
				}},
				"concretes": array { /*/${QNS.w}num/map {
					"id": ./@${QNS.w}numId/number(),
					"abstract": ./${QNS.w}abstractNumId/@${QNS.w}val/number()
				}}
			}`,
			dom,
		);
		abstracts.forEach((abstract) => instance.addAbstract(abstract));
		concretes.forEach((concrete) => instance.concretes.set(concrete.id, concrete));

		return instance;
	}

	public static async fromArchive(archive: Archive, location: string): Promise<Numbering> {
		return this.fromNode(await archive.readXml(location), location);
	}
}
