import { Length } from '../utilities/length.ts';

export type Border<Type extends string> = {
	color?: null | string;
	width?: null | Length;
	spacing?: null | number;
	type?: null | Type;
};
