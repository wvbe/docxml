import { JsonmlWithStyles } from '../types.ts';

export interface ComponentI<Props, Yield> {
	type: string;
	toDocx(props: Props): Promise<Yield>;
	toJsonml(props: Props): Promise<JsonmlWithStyles>;
}

export abstract class Component<Props, Yield> {
	abstract type: string;
	abstract toDocx(props: Props): Promise<Yield>;
	abstract toJsonml(props: Props): Promise<JsonmlWithStyles>;
}
