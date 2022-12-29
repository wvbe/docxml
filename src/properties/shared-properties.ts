import { Length } from '../utilities/length.ts';

export type Border<Type extends string> = {
	color?: null | string;
	width?: null | Length;
	spacing?: null | number;
	type?: null | Type;
};

export type LineBorderType =
	| 'single'
	| 'dashDotStroked'
	| 'dashed'
	| 'dashSmallGap'
	| 'dotDash'
	| 'dotDotDash'
	| 'dotted'
	| 'double'
	| 'doubleWave'
	| 'inset'
	| 'nil'
	| 'none'
	| 'outset'
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
	| 'triple'
	| 'wave';
