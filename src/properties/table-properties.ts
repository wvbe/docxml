import { EightPoint } from '../types.ts';
import { create } from '../utilities/dom.ts';
import { Length } from '../utilities/length.ts';
import { NamespaceUri, QNS } from '../utilities/namespaces.ts';
import { evaluateXPathToMap } from '../utilities/xquery.ts';

type TableBorderType =
	| 'auto'
	| 'apples'
	| 'archedScallops'
	| 'babyPacifier'
	| 'babyRattle'
	| 'balloons3Colors'
	| 'balloonsHotAir'
	| 'basicBlackDashes'
	| 'basicBlackDots'
	| 'basicBlackSquares'
	| 'basicThinLines'
	| 'basicWhiteDashes'
	| 'basicWhiteDots'
	| 'basicWhiteSquares'
	| 'basicWideInline'
	| 'basicWideMidline'
	| 'basicWideOutline'
	| 'bats'
	| 'birds'
	| 'birdsFlight'
	| 'cabins'
	| 'cakeSlice'
	| 'candyCorn'
	| 'celticKnotwork'
	| 'certificateBanner'
	| 'chainLink'
	| 'champagneBottle'
	| 'checkedBarBlack'
	| 'checkedBarColor'
	| 'checkered'
	| 'christmasTree'
	| 'circlesLines'
	| 'circlesRectangles'
	| 'classicalWave'
	| 'clocks'
	| 'compass'
	| 'confetti'
	| 'confettiGrays'
	| 'confettiOutline'
	| 'confettiStreamers'
	| 'confettiWhite'
	| 'cornerTriangles'
	| 'couponCutoutDashes'
	| 'couponCutoutDots'
	| 'crazyMaze'
	| 'creaturesButterfly'
	| 'creaturesFish'
	| 'creaturesInsects'
	| 'creaturesLadyBug'
	| 'crossStitch'
	| 'cup'
	| 'dashDotStroked'
	| 'dashed'
	| 'dashSmallGap'
	| 'decoArch'
	| 'decoArchColor'
	| 'decoBlocks'
	| 'diamondsGray'
	| 'dotDash'
	| 'dotDotDash'
	| 'dotted'
	| 'double'
	| 'doubleD'
	| 'doubleDiamonds'
	| 'doubleWave'
	| 'earth1'
	| 'earth2'
	| 'eclipsingSquares1'
	| 'eclipsingSquares2'
	| 'eggsBlack'
	| 'fans'
	| 'film'
	| 'firecrackers'
	| 'flowersBlockPrint'
	| 'flowersDaisies'
	| 'flowersModern1'
	| 'flowersModern2'
	| 'flowersPansy'
	| 'flowersRedRose'
	| 'flowersRoses'
	| 'flowersTeacup'
	| 'flowersTiny'
	| 'gems'
	| 'gingerbreadMan'
	| 'gradient'
	| 'handmade1'
	| 'handmade2'
	| 'heartBalloon'
	| 'heartGray'
	| 'hearts'
	| 'heebieJeebies'
	| 'holly'
	| 'houseFunky'
	| 'hypnotic'
	| 'iceCreamCones'
	| 'inset'
	| 'lightBulb'
	| 'lightning1'
	| 'lightning2'
	| 'mapleLeaf'
	| 'mapleMuffins'
	| 'mapPins'
	| 'marquee'
	| 'marqueeToothed'
	| 'moons'
	| 'mosaic'
	| 'musicNotes'
	| 'nil'
	| 'none'
	| 'northwest'
	| 'outset'
	| 'ovals'
	| 'packages'
	| 'palmsBlack'
	| 'palmsColor'
	| 'paperClips'
	| 'papyrus'
	| 'partyFavor'
	| 'partyGlass'
	| 'pencils'
	| 'people'
	| 'peopleHats'
	| 'peopleWaving'
	| 'poinsettias'
	| 'postageStamp'
	| 'pumpkin1'
	| 'pushPinNote1'
	| 'pushPinNote2'
	| 'pyramids'
	| 'pyramidsAbove'
	| 'quadrants'
	| 'rings'
	| 'safari'
	| 'sawtooth'
	| 'sawtoothGray'
	| 'scaredCat'
	| 'seattle'
	| 'shadowedSquares'
	| 'sharksTeeth'
	| 'shorebirdTracks'
	| 'single'
	| 'skyrocket'
	| 'snowflakeFancy'
	| 'snowflakes'
	| 'sombrero'
	| 'southwest'
	| 'stars'
	| 'stars3d'
	| 'starsBlack'
	| 'starsShadowed'
	| 'starsTop'
	| 'sun'
	| 'swirligig'
	| 'thick'
	| 'thickThinLargeGap'
	| 'thickThinMediumGap'
	| 'thickThinSmallGap'
	| 'thinThickLargeGap'
	| 'thinThickMediumGap'
	| 'thinThickSmallGap'
	| 'thinThickThinLargeGap'
	| 'thinThickThinMediumGap'
	| 'thinThickThinSmallGap'
	| 'threeDEmboss'
	| 'threeDEngrave'
	| 'tornPaper'
	| 'tornPaperBlack'
	| 'trees'
	| 'triangleParty'
	| 'triangles'
	| 'tribal1'
	| 'tribal2'
	| 'tribal3'
	| 'tribal4'
	| 'tribal5'
	| 'tribal6'
	| 'triple'
	| 'twistedLines1'
	| 'twistedLines2'
	| 'vine'
	| 'wave'
	| 'waveline'
	| 'weavingAngles'
	| 'weavingBraid'
	| 'weavingRibbon'
	| 'weavingStrips'
	| 'whiteFlowers'
	| 'woodwork'
	| 'xIllusions'
	| 'zanyTriangles'
	| 'zigZag'
	| 'zigZagStitch';

type TableBorder = {
	color?: null | string;
	width?: null | Length;
	spacing?: null | number;
	type?: null | TableBorderType;
};

export type TableProperties = {
	style?: string | null;
	/**
	 * @deprecated Use columnWidths instead. Also, this API sucks.
	 */
	width?:
		| null
		| number
		| '`${number}%'
		| string
		| {
				length: '`${number}%' | string | number;
				unit: null | 'nil' | 'auto' | 'dxa' | 'pct';
		  };
	/**
	 * @todo rename to something more descriptive?
	 */
	look?: null | {
		firstColumn?: null | boolean;
		lastColumn?: null | boolean;
		firstRow?: null | boolean;
		lastRow?: null | boolean;
		noHBand?: null | boolean;
		noVBand?: null | boolean;
	};
	borders?: null | {
		top?: null | TableBorder;
		left?: null | TableBorder;
		bottom?: null | TableBorder;
		right?: null | TableBorder;
		insideH?: null | TableBorder;
		insideV?: null | TableBorder;
	};
};

export function tablePropertiesFromNode(node?: Node | null): TableProperties {
	return node
		? evaluateXPathToMap(
				`
						map {
							"style": ./${QNS.w}tblStyle/@${QNS.w}val/string(),
							"look": ./${QNS.w}tblLook/map {
								"firstColumn": ./@${QNS.w}firstColumn/ooxml:is-on-off-enabled(.),
								"lastColumn": ./@${QNS.w}lastColumn/ooxml:is-on-off-enabled(.),
								"firstRow": ./@${QNS.w}firstRow/ooxml:is-on-off-enabled(.),
								"lastRow": ./@${QNS.w}lastRow/ooxml:is-on-off-enabled(.),
								"noHBand": ./@${QNS.w}noHBand/ooxml:is-on-off-enabled(.),
								"noVBand": ./@${QNS.w}noVBand/ooxml:is-on-off-enabled(.)
							},
							"borders": ./${QNS.w}tblBorders/map {
								"top": ./${QNS.w}top/ooxml:table-border(.),
								"right": ./${QNS.w}right/ooxml:table-border(.),
								"bottom": ./${QNS.w}bottom/ooxml:table-border(.),
								"left": ./${QNS.w}left/ooxml:table-border(.),
								"insideH": ./${QNS.w}insideH/ooxml:table-border(.),
								"insideV": ./${QNS.w}insideV/ooxml:table-border(.)
							},
							"width": ./${QNS.w}tblW/map {
								"length": ./@${QNS.w}val/string(),
								"unit": ./@${QNS.w}type/string()
							}
						}
					`,
				node,
		  )
		: {};
}

export function tablePropertiesToNode(tblpr: TableProperties = {}): Node {
	return create(
		`
				element ${QNS.w}tblPr {
					if ($style) then element ${QNS.w}tblStyle {
						attribute ${QNS.w}val { $style }
					} else (),
					if (exists($width)) then element ${QNS.w}tblW {
						attribute ${QNS.w}val { $width('length') },
						attribute ${QNS.w}type { $width('unit') }
					} else (),
					if (exists($look)) then element ${QNS.w}tblLook {
						if ($look('firstColumn')) then attribute ${QNS.w}firstColumn { "1" } else (),
						if ($look('firstRow')) then attribute ${QNS.w}firstRow { "1" } else (),
						if ($look('lastColumn')) then attribute ${QNS.w}lastColumn { "1" } else (),
						if ($look('lastRow')) then attribute ${QNS.w}lastRow { "1" } else (),
						if ($look('noHBand')) then attribute ${QNS.w}noHBand { "1" } else (),
						if ($look('noVBand')) then attribute ${QNS.w}noVBand { "1"}  else ()
					} else (),
					if (exists($borders)) then element ${QNS.w}tblBorders {
						ooxml:create-table-border(fn:QName("${NamespaceUri.w}", "top"), $borders('top')),
						ooxml:create-table-border(fn:QName("${NamespaceUri.w}", "right"), $borders('right')),
						ooxml:create-table-border(fn:QName("${NamespaceUri.w}", "bottom"), $borders('bottom')),
						ooxml:create-table-border(fn:QName("${NamespaceUri.w}", "left"), $borders('left')),
						ooxml:create-table-border(fn:QName("${NamespaceUri.w}", "insideH"), $borders('insideH')),
						ooxml:create-table-border(fn:QName("${NamespaceUri.w}", "insideV"), $borders('insideV'))
					} else ()

				}
			`,
		{
			style: tblpr.style || null,
			look: tblpr.look || null,
			width:
				typeof tblpr.width === 'string' && tblpr.width.endsWith('%')
					? { length: tblpr.width, unit: 'pct' }
					: typeof tblpr.width === 'number'
					? {
							length: tblpr.width,
							unit: 'dxa',
					  }
					: tblpr.width || null,
			borders: tblpr.borders
				? {
						top: null,
						left: null,
						right: null,
						bottom: null,
						insideH: null,
						insideV: null,
						...tblpr.borders,
				  }
				: null,
		},
	);
}
